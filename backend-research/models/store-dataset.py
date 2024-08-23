import os
import requests
import dotenv
import pymysql
import json
import multiprocessing
from sqlalchemy import Column, Integer, String, Text, Date, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.exc import IntegrityError
from tidb_vector.sqlalchemy import VectorType
from datasets import load_dataset
from datetime import datetime
from functools import partial

# Load environment variables from .env file
dotenv.load_dotenv()

pymysql.install_as_MySQLdb()

# Get environment variables
JINAAI_API_KEY = os.getenv('JINA_API_KEY')
TIDB_DATABASE_URL = os.getenv('TIDB_DATABASE_URL')

if not JINAAI_API_KEY or not TIDB_DATABASE_URL:
    raise ValueError("API key or database URL not found in environment variables")

# Define the generate_embeddings function
def generate_embeddings(text: str):
    JINAAI_API_URL = 'https://api.jina.ai/v1/embeddings'
    JINAAI_HEADERS = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {JINAAI_API_KEY}'
    }
    JINAAI_REQUEST_DATA = {
        'input': [text],
        'model': 'jina-embeddings-v2-base-en'  # with dimension 768
    }
    response = requests.post(JINAAI_API_URL, headers=JINAAI_HEADERS, json=JINAAI_REQUEST_DATA)
    return response.json()['data'][0]['embedding']

# Connect to TiDB Serverless through SQLAlchemy
engine = create_engine(TIDB_DATABASE_URL, pool_recycle=300)
Session = sessionmaker(bind=engine)

# Define the vector table schema
Base = declarative_base()

class ResearchPaper(Base):
    __tablename__ = "research_paper"
    id = Column(Integer, primary_key=True)
    title = Column(String(255), nullable=False)
    authors = Column(Text)
    journal_ref = Column(String(255))
    doi = Column(String(255))
    license = Column(String(255))
    abstract = Column(Text)
    versions = Column(Text)
    content_vec = Column(VectorType(dim=768), comment="hnsw(distance=cosine)")
    update_date = Column(Date)

# Create the table if it doesn't exist
Base.metadata.create_all(engine)

# Load the dataset
ds = load_dataset("Falah/arxiv-research-paper")

# Define the range of rows to process
start_row = 20001
end_row = 25000

# Helper function to process a single paper and generate embedding
def process_paper(paper):
    try:
        title = paper.get('title', '')
        authors = paper.get('authors', '')
        journal_ref = paper.get('journal-ref', '')
        doi = paper.get('doi', '')
        license_info = paper.get('license', '')
        abstract = paper.get('abstract', '')
        versions = paper.get('versions', '')
        update_date = paper.get('update_date', None)

        combined_text = f"Title: {title}\nAbstract: {abstract}"
        embedding = generate_embeddings(combined_text)

        # Ensure embedding is a list
        if not isinstance(embedding, list):
            raise ValueError(f"Expected embedding to be a list, got {type(embedding)}")

        return {
            'title': title,
            'authors': authors,
            'journal_ref': journal_ref,
            'doi': doi,
            'license': license_info,
            'abstract': abstract,
            'versions': versions,
            'embedding': embedding,
            'update_date': update_date
        }
    except Exception as e:
        print(f'Error processing paper: {e}')
        return None

def main():
    # Use multiprocessing to process papers in parallel
    with multiprocessing.Pool(processes=4) as pool:  # Adjust the number of processes based on your system
        data = pool.map(process_paper, ds['train'].select(range(start_row, end_row)))

    # Filter out None values (papers that failed processing)
    data = [item for item in data if item is not None]

    # Serialize data as needed
    def serialize_data(data):
        if isinstance(data, list):
            return json.dumps(data)
        return data

    # Perform batch insertion into the database
    BATCH_SIZE = 100  # Insert records in batches of 100

    with Session() as session:
        print('- Inserting Data to TiDB...')
        for i in range(0, len(data), BATCH_SIZE):
            batch = data[i:i + BATCH_SIZE]
            try:
                session.bulk_save_objects([
                    ResearchPaper(
                        title=item['title'],
                        authors=item['authors'],
                        journal_ref=item['journal_ref'],
                        doi=item['doi'],
                        license=item['license'],
                        abstract=serialize_data(item['abstract']),
                        versions=serialize_data(item['versions']),
                        content_vec=item['embedding'],
                        update_date=item['update_date']
                    ) for item in batch
                ])
                session.commit()
            except IntegrityError:
                session.rollback()
                print('  - Error occurred during batch insertion, rolling back')
            except Exception as e:
                session.rollback()
                print(f'  - Unexpected error: {e}')

    print('Data insertion completed.')

if __name__ == "__main__":
    main()

import os
from tidb_vector.sqlalchemy import VectorType
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from generate_embeddings import generate_embeddings
from dotenv import load_dotenv

load_dotenv()

# Database URL
TIDB_DATABASE_URL = os.getenv('TIDB_DATABASE_URL')

# SQLAlchemy setup
engine = create_engine(TIDB_DATABASE_URL)
Session = sessionmaker(bind=engine)
Base = declarative_base()

class VectorArticle(Base):
    __tablename__ = 'test_vector_article'
    id = Column(Integer, primary_key=True)
    title = Column(String(255))
    content = Column(String(255))
    embedding = Column('embedding', VectorType(dim=768))

Base.metadata.create_all(engine)

# Insert test data
def insert_data():
    texts = [
        'Jina AI offers best-in-class embeddings, reranker and prompt optimizer.',
        'TiDB is an open-source MySQL-compatible database supporting HTAP workloads.',
    ]
    
    data = []
    for text in texts:
        embedding = generate_embeddings(text)
        data.append({'title': text, 'content': text, 'embedding': embedding})
    
    with Session() as session:
        for item in data:
            session.add(VectorArticle(**item))
        session.commit()
        print('Data inserted successfully.')

if __name__ == '__main__':
    insert_data()

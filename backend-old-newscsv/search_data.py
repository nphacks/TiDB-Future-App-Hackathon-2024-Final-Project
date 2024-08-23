import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from generate_embeddings import generate_embeddings
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database URL
TIDB_DATABASE_URL = os.getenv('TIDB_DATABASE_URL')

# SQLAlchemy setup
engine = create_engine(TIDB_DATABASE_URL)
Session = sessionmaker(bind=engine)

def search_query(query):
    query_embedding = generate_embeddings(query)
    
    with Session() as session:
        try:
            # Basic query to check functionality
            sql = text('''
                SELECT id, title, content
                FROM test_vector_article
                LIMIT 1
            ''')
            results = session.execute(sql).fetchall()
            for row in results:
                print(f"ID: {row.id}, Title: {row.title}, Content: {row.content}")
            
            # Debugging output
            print("Query embedding:", query_embedding)
            
        except Exception as e:
            print(f"An error occurred: {e}")

if __name__ == '__main__':
    search_query('What is TiDB?')

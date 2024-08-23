import csv

# Path to your CSV file
file_path = 'news_db.news.csv'

with open(file_path, mode='r', newline='') as file:
    reader = csv.reader(file)
    
    # Initialize a list to store the first two rows
    first_two_rows = []
    
    # Collect the first two rows
    for i, row in enumerate(reader):
        if i < 5:
            first_two_rows.append(row)
        else:
            break
    
    # Check if there are at least two rows
    if len(first_two_rows) < 5:
        print("The file does not have two rows.")
    else:
        # Print each column from the first row
        print("First Row Columns:")
        for col in first_two_rows[0]:
            print(col)
        
        # Print each column from the second row
        print("\nSecond Row Columns:")
        for col in first_two_rows[1]:
            print(col)

        # Print each column from the second row
        print("\Third Row Columns:")
        for col in first_two_rows[2]:
            print(col)

        # Print each column from the second row
        print("\Forth Row Columns:")
        for col in first_two_rows[3]:
            print(col)
        
        # Print each column from the second row
        print("\Fifth Row Columns:")
        for col in first_two_rows[4]:
            print(col)


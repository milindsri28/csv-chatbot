import pandas as pd
import re
import numpy as np

class CSVChatbot:
    def __init__(self, csv_path):
        """
        Initialize the chatbot with a CSV dataset
        
        :param csv_path: Path to the CSV file
        """
        self.df = pd.read_csv(csv_path)
        
    def process_query(self, query):
        """
        Process user query and return relevant information
        
        :param query: User's natural language query
        :return: Relevant dataset rows or insights
        """
        query = query.lower()
        
        # Genre-based query
        if 'genre' in query:
            genre_match = re.search(r'(drama|crime|action|sci-fi|thriller)', query)
            if genre_match:
                genre = genre_match.group(1).capitalize()
                return self._filter_by_genre(genre)
        
        # Year-based query
        if 'year' in query:
            year_match = re.findall(r'\b(19\d{2}|20\d{2})\b', query)
            if year_match:
                return self._filter_by_year(int(year_match[0]))
        
        # Director-based query
        if 'director' in query:
            director_match = re.findall(r'directed by (\w+\s*\w*)', query)
            if director_match:
                return self._filter_by_director(director_match[0])
        
        # Rating-based query
        if 'rating' in query:
            rating_match = re.findall(r'rating (>|<|>=|<=) (\d+\.?\d*)', query)
            if rating_match:
                operator, rating = rating_match[0]
                return self._filter_by_rating(float(rating), operator)
        
        return "Sorry, I couldn't understand your query. Try asking about genre, year, director, or rating."
    
    def _filter_by_genre(self, genre):
        """Filter movies by genre"""
        genre_movies = self.df[self.df['genre'] == genre]
        return genre_movies.to_string(index=False) if not genre_movies.empty else "No movies found in this genre."
    
    def _filter_by_year(self, year):
        """Filter movies by year"""
        year_movies = self.df[self.df['year'] == year]
        return year_movies.to_string(index=False) if not year_movies.empty else "No movies found in this year."
    
    def _filter_by_director(self, director):
        """Filter movies by director"""
        director_movies = self.df[self.df['director'].str.contains(director, case=False)]
        return director_movies.to_string(index=False) if not director_movies.empty else "No movies found by this director."
    
    def _filter_by_rating(self, rating, operator):
        """Filter movies by rating"""
        if operator == '>':
            rating_movies = self.df[self.df['rating'] > rating]
        elif operator == '<':
            rating_movies = self.df[self.df['rating'] < rating]
        elif operator == '>=':
            rating_movies = self.df[self.df['rating'] >= rating]
        elif operator == '<=':
            rating_movies = self.df[self.df['rating'] <= rating]
        
        return rating_movies.to_string(index=False) if not rating_movies.empty else "No movies found matching this rating criteria."

def main():
    chatbot = CSVChatbot('movies.csv')
    
    print("CSV Dataset Chatbot")
    print("Ask me questions about movies. Type 'exit' to quit.")
    
    while True:
        query = input("\nYour query: ")
        
        if query.lower() == 'exit':
            break
        
        response = chatbot.process_query(query)
        print("\nResponse:\n", response)

if __name__ == "__main__":
    main()

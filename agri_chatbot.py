import tkinter as tk
from tkinter import ttk, scrolledtext
import pandas as pd
import re
from tkinter import messagebox

class AgriChatbotGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Agricultural Data Chatbot")
        self.root.geometry("1000x700")
        
        # Set theme and style
        style = ttk.Style()
        style.theme_use('clam')
        
        # Configure colors
        self.bg_color = "#f0f0f0"
        self.accent_color = "#2E7D32"  # Forest green
        self.root.configure(bg=self.bg_color)
        
        # Load the dataset
        try:
            self.df = pd.read_csv('Combined_Data.csv')
            self.create_gui()
        except Exception as e:
            messagebox.showerror("Error", f"Failed to load dataset: {str(e)}")
            self.root.destroy()
    
    def create_gui(self):
        # Create main frame
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Title
        title_label = ttk.Label(
            main_frame,
            text="Agricultural Data Assistant",
            font=('Helvetica', 16, 'bold')
        )
        title_label.pack(pady=10)
        
        # Chat display
        self.chat_display = scrolledtext.ScrolledText(
            main_frame,
            wrap=tk.WORD,
            height=20,
            font=('Helvetica', 10),
            bg="white"
        )
        self.chat_display.pack(fill=tk.BOTH, expand=True, pady=10)
        
        # Input frame
        input_frame = ttk.Frame(main_frame)
        input_frame.pack(fill=tk.X, pady=10)
        
        # Query input
        self.query_var = tk.StringVar()
        self.query_entry = ttk.Entry(
            input_frame,
            textvariable=self.query_var,
            font=('Helvetica', 10)
        )
        self.query_entry.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(0, 10))
        
        # Send button
        send_button = ttk.Button(
            input_frame,
            text="Send",
            command=self.process_query,
            style='Accent.TButton'
        )
        send_button.pack(side=tk.RIGHT)
        
        # Example queries frame
        examples_frame = ttk.LabelFrame(main_frame, text="Example Queries", padding="5")
        examples_frame.pack(fill=tk.X, pady=10)
        
        examples = [
            "Show all crops in INDORE zone",
            "List regions in HYDERABAD zone",
            "Show data for CORN crop",
            "Find all VEGETABLES",
            "Show crops in TRADE division"
        ]
        
        for example in examples:
            example_btn = ttk.Button(
                examples_frame,
                text=example,
                command=lambda q=example: self.set_example_query(q)
            )
            example_btn.pack(side=tk.LEFT, padx=5)
        
        # Bind Enter key to process_query
        self.query_entry.bind('<Return>', lambda event: self.process_query())
        
        # Initial greeting
        self.display_message(
            "Bot: Welcome to the Agricultural Data Assistant! I can help you analyze crop data across different zones and regions. "
            "Try the example queries below or ask your own questions.", "bot")
    
    def set_example_query(self, query):
        self.query_var.set(query)
        self.process_query()
    
    def display_message(self, message, sender):
        self.chat_display.insert(tk.END, f"{message}\n\n")
        self.chat_display.see(tk.END)
    
    def process_query(self):
        query = self.query_var.get().strip()
        if not query:
            return
        
        # Display user query
        self.display_message(f"You: {query}", "user")
        
        # Process query
        query = query.lower()
        response = ""
        
        # Zone-based query
        if 'zone' in query:
            zone_match = re.search(r'in (\w+) zone', query)
            if zone_match:
                zone = zone_match.group(1).upper()
                zone_data = self.df[self.df['ZO'] == zone]
                if not zone_data.empty:
                    unique_crops = zone_data['Crop'].unique()
                    response = f"Crops in {zone} zone:\n" + "\n".join(unique_crops)
                else:
                    response = f"No data found for {zone} zone."
        
        # Region-based query
        elif 'region' in query:
            zone_match = re.search(r'in (\w+)', query)
            if zone_match:
                zone = zone_match.group(1).upper()
                zone_data = self.df[self.df['ZO'] == zone]
                if not zone_data.empty:
                    unique_regions = zone_data['RO'].unique()
                    response = f"Regions in {zone}:\n" + "\n".join(unique_regions)
                else:
                    response = f"No regions found for {zone}."
        
        # Crop-based query
        elif 'crop' in query or any(crop.lower() in query for crop in self.df['Crop'].unique()):
            crop_pattern = '|'.join(self.df['Crop'].unique())
            crop_match = re.search(rf'({crop_pattern})', query, re.IGNORECASE)
            if crop_match:
                crop = crop_match.group(1).upper()
                crop_data = self.df[self.df['Crop'] == crop]
                if not crop_data.empty:
                    summary = crop_data.groupby(['ZO', 'RO']).agg({
                        'CME': 'sum',
                        'H1PV': 'sum'
                    }).reset_index()
                    response = f"Data for {crop}:\n" + summary.to_string(index=False)
                else:
                    response = f"No data found for {crop}."
        
        # Division-based query
        elif 'division' in query:
            div_match = re.search(r'in (\w+) division', query)
            if div_match:
                division = div_match.group(1).upper()
                div_data = self.df[self.df['Divisions'] == division]
                if not div_data.empty:
                    unique_crops = div_data['Crop'].unique()
                    response = f"Crops in {division} division:\n" + "\n".join(unique_crops)
                else:
                    response = f"No data found for {division} division."
        
        if not response:
            response = ("I couldn't understand your query. Try asking about:\n"
                       "1. Crops in a specific zone (e.g., 'Show all crops in INDORE zone')\n"
                       "2. Regions in a zone (e.g., 'List regions in HYDERABAD zone')\n"
                       "3. Specific crop data (e.g., 'Show data for CORN crop')\n"
                       "4. Division information (e.g., 'Show crops in TRADE division')")
        
        # Display bot response
        self.display_message(f"Bot: {response}", "bot")
        
        # Clear input
        self.query_var.set("")

def main():
    root = tk.Tk()
    app = AgriChatbotGUI(root)
    root.mainloop()

if __name__ == "__main__":
    main()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from pydantic import BaseModel
from typing import Optional

app = FastAPI()

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load CSV data
try:
    csv_path = 'C:\\Users\\MIILND\\CascadeProjects\\csv_chatbot\Combined_Data.csv'
    print(f"Loading CSV from: {csv_path}")
    df = pd.read_csv(csv_path)
    print("CSV loaded successfully")
    print(f"Columns: {df.columns.tolist()}")
    print(f"Number of rows: {len(df)}")
except Exception as e:
    print(f"Error loading dataset: {str(e)}")
    raise

class ChatRequest(BaseModel):
    text: str

class ChatResponse(BaseModel):
    response: str
    data: Optional[dict] = None

@app.post("/chat")
def chat(request: ChatRequest):
    text = request.text.lower()
    response = ""
    data = None

    if "total sales" in text:
        total_estimated = df['CME'].sum()
        total_value = df['YTDPV'].sum() if 'YTDPV' in df.columns else 0.0
        response = f"The total estimated sales are {total_estimated:,.2f} and total value is {total_value:,.2f}"
        data = {"total_estimated": total_estimated, "total_value": total_value}

    elif "sales by crop" in text:
        sales_data = df.groupby('Crop')[['CME', 'YTDPV']].sum().reset_index()
        sales_data = sales_data.sort_values('CME', ascending=False)
        response = "Here are the sales figures by crop:"
        data = {"crop_sales": sales_data.to_dict('records')}

    elif "sales by zone" in text:
        sales_data = df.groupby('ZO')[['CME', 'YTDPV']].sum().reset_index()
        sales_data = sales_data.sort_values('CME', ascending=False)
        response = "Here are the sales figures by zone:"
        data = {"zone_sales": sales_data.to_dict('records')}

    elif "top performing crops" in text:
        top_crops = df.groupby('Crop')['CME'].sum().sort_values(ascending=False).head(5)
        response = "Here are the top 5 performing crops based on estimated sales:"
        data = {"top_crops": top_crops.to_dict()}

    elif "crop distribution" in text:
        distribution = df.groupby(['ZO', 'Crop']).size().reset_index(name='count')
        distribution = distribution.sort_values('count', ascending=False)
        response = "Here's the distribution of crops across zones:"
        data = {"distribution": distribution.to_dict('records')}

    else:
        response = "I'm sorry, I don't understand that query. Try asking about total sales, sales by crop, sales by zone, top performing crops, or crop distribution."

    return ChatResponse(response=response, data=data)

@app.get("/api/metadata")
async def get_metadata():
    """Get metadata about the dataset"""
    try:
        return {
            "zones": df['ZO'].unique().tolist(),
            "crops": df['Crop'].unique().tolist(),
            "divisions": df['Vertical'].unique().tolist()  
        }
    except Exception as e:
        print(f"Error in get_metadata: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

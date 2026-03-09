from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User
from app.models.transaction import Transaction
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from google import genai
from dotenv import load_dotenv
import os

load_dotenv()

router = APIRouter(prefix="/ai", tags=["AI Insights"])
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    try:
        payload = decode_access_token(credentials.credentials)
        user_id = int(payload.get("sub"))
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.get("/insights")
def get_insights(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id
    ).all()

    if not transactions:
        return {"insights": "Add some transactions first and I'll analyze your spending patterns!"}

    income = sum(t.amount for t in transactions if t.type.value == "income")
    expense = sum(t.amount for t in transactions if t.type.value == "expense")
    balance = income - expense

    categories = {}
    for t in transactions:
        if t.type.value == "expense":
            categories[t.category] = categories.get(t.category, 0) + t.amount

    category_breakdown = "\n".join([f"- {cat}: ₹{amt:.2f}" for cat, amt in categories.items()])

    prompt = f"""
    You are a friendly personal finance advisor. Analyze this user's financial data and give 3-4 practical, specific insights and tips.

    Financial Summary:
    - Total Income: ₹{income:.2f}
    - Total Expenses: ₹{expense:.2f}
    - Balance: ₹{balance:.2f}
    - Savings Rate: {((balance/income)*100):.1f}% of income saved

    Expense Categories:
    {category_breakdown if category_breakdown else "No expenses recorded yet"}

    Give actionable advice in a friendly conversational tone. Keep it concise — 3 to 4 short paragraphs max.
    """

    try:
        client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents=prompt
        )
        return {"insights": response.candidates[0].content.parts[0].text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI error: {str(e)}")
    
    except Exception as e:
        print(f"GEMINI ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI error: {str(e)}")
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User
from app.models.transaction import Transaction
from app.schemas.transaction import TransactionCreate, TransactionResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List

router = APIRouter(prefix="/transactions", tags=["Transactions"])
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

@router.post("/", response_model=TransactionResponse)
def create_transaction(
    transaction_data: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_transaction = Transaction(
        amount=transaction_data.amount,
        type=transaction_data.type.value,
        category=transaction_data.category,
        description=transaction_data.description,
        user_id=current_user.id
    )
    db.add(new_transaction)
    db.commit()
    db.refresh(new_transaction)
    return new_transaction

@router.get("/", response_model=List[TransactionResponse])
def get_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id
    ).all()
    return transactions

@router.get("/summary")
def get_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id
    ).all()

    income = sum(t.amount for t in transactions if t.type.value == "income")
    expense = sum(t.amount for t in transactions if t.type.value == "expense")
    balance = income - expense

    return {
        "total_income": income,
        "total_expense": expense,
        "balance": balance,
        "transaction_count": len(transactions)
    }

@router.delete("/{transaction_id}")
def delete_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id
    ).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    db.delete(transaction)
    db.commit()
    return {"message": "Transaction deleted"}
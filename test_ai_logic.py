"""Interactive CLI test for problem-solving chatbot flow."""

import sys
from pathlib import Path


sys.path.append(str(Path(__file__).resolve().parent / "backend"))

from app.llm.gemini_client import ProblemSolvingAgent  # noqa: E402


def run_interactive_chat() -> None:
    agent = ProblemSolvingAgent()
    methodology = "5why"
    analysis_started = False

    print("Isletme sorununu yaz ve analizi baslatalim.")

    while True:
        user_message = input("[USER]: ").strip()
        if user_message.lower() in {"exit", "quit"}:
            print("Sohbet sonlandirildi.")
            break
        if not user_message:
            continue

        try:
            if ProblemSolvingAgent.is_mail_send_approval(user_message):
                if not analysis_started:
                    print("Once bir isletme sorunu yazarak analizi baslatin.")
                    continue
                results = agent.approve_pending_emails()
                print("\n=== MAIL ONAY SONUCU ===")
                if not results:
                    print("Gonderilecek bekleyen mail taslagi yok (optional_actions icinde draft_email aranir).")
                for row in results:
                    durum = "Gonderildi" if row.get("ok") else "Gonderilemedi"
                    print(f"  → {row.get('to')}: {durum}")
                    print(f"    {row.get('detail')}")
                print("=== /MAIL ===\n")
                continue

            if not analysis_started:
                ai_response = agent.start_analysis(problem=user_message, methodology=methodology)
                analysis_started = True
            else:
                ai_response = agent.get_next_step(history=[], user_input=user_message)
            print("\n=== AI RESPONSE (5WHY) ===")
            print(ai_response)
            print("=== END RESPONSE ===\n")
            pending = agent.get_pending_email_drafts()
            if pending:
                print(
                    f"[BILGI] {len(pending)} adet mail taslagi kuyrukta. "
                    "SMTP .env ayarliysa gondermek icin: Onayla\n"
                )
        except Exception as exc:  # noqa: BLE001
            print("\n=== HATA ===")
            print(f"AI testi sirasinda hata olustu: {exc}")
            print("=== /HATA ===\n")


if __name__ == "__main__":
    run_interactive_chat()

import { Link } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";

const ForgotPassword = () => (
  <div className="min-h-screen flex items-center justify-center bg-background px-4">
    <div className="w-full max-w-md">
      <div className="bg-card rounded-xl border border-border shadow-lg p-8">
        <Link to="/login" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> 로그인으로 돌아가기
        </Link>
        <div className="text-center py-6">
          <Mail className="w-12 h-12 text-primary mx-auto mb-3" />
          <h1 className="text-xl font-bold text-foreground mb-2">비밀번호 찾기</h1>
          <p className="text-sm text-muted-foreground">
            비밀번호 초기화는 시스템 관리자에게 문의해 주세요.
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default ForgotPassword;

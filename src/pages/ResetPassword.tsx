import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center">
        <p className="text-muted-foreground">유효하지 않은 접근입니다.</p>
        <button onClick={() => navigate("/login")} className="mt-4 text-primary hover:underline text-sm">
          로그인으로 이동
        </button>
      </div>
    </div>
  );
};

export default ResetPassword;

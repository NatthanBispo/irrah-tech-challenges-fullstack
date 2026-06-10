import { LoginForm } from '../../features/auth/components/LoginForm';

export function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-1 text-center text-2xl font-bold text-slate-900">
          Big Chat Brasil
        </h1>
        <p className="mb-8 text-center text-sm text-slate-500">
          Identifique-se para acessar suas conversas
        </p>
        <LoginForm />
      </div>
    </div>
  );
}

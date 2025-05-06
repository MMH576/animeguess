import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-black py-12 flex justify-center items-center">
      <div className="max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-8 text-[#8B11D1]">
          Sign In
        </h1>
        <SignIn
          appearance={{
            elements: {
              formButtonPrimary: "bg-[#8B11D1] hover:bg-[#8B11D1]/80",
              footerActionLink: "text-[#8B11D1] hover:text-[#8B11D1]/80",
            },
          }}
        />
      </div>
    </main>
  );
} 
import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { AuthShell } from "./AuthShell";
import { Input, Select, Checkbox } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { deployedPlatform } from "@/lib/platformUrls";

export function RegisterPage() {
  const { signUp, configured } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedService = searchParams.get("service");
  const platformService: Record<string,string> = { datasub:"datasub", schoolpro:"school", consult:"consult", host:"host", engineering:"engineering", print:"print", fabrication:"fabrication", compute:"compute", academy:"academy", digital_business:"digital_business" };
  const fixedService = deployedPlatform === "corporate" ? null : platformService[deployedPlatform] || null;
  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    phone: "",
    sex: "",
    email: "",
    service: fixedService || requestedService || "explore",
    password: "",
    confirm: "",
  });
  const [accepted, setAccepted] = useState(false);
  const [newsletterOptIn, setNewsletterOptIn] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const update = (key: string, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));
  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (![form.firstName, form.middleName, form.lastName].every(name => name.trim())) return setError("Enter your first name, middle name and surname.");

    if (form.password.length < 8)
      return setError("Use at least eight characters for your password.");
    if (form.password !== form.confirm)
      return setError("The two passwords do not match.");
    if (!accepted)
      return setError("Please accept the Terms and Privacy Policy.");
    setBusy(true);
    const result = await signUp({
      email: form.email,
      password: form.password,
      firstName: form.firstName,
      middleName: form.middleName,
      lastName: form.lastName,
      phone: form.phone,
      sex: form.sex,
      newsletterOptIn,
      service: form.service,
    });
    setBusy(false);
    if (result.error) return setError(result.error);
    if (result.existingAccount) {
      navigate("/signin", { state: { authNotice: "An IHLink account already exists for this email. Sign in with its password or use Forgot password to recover access." } });
      return;
    }
    if (result.needsVerification) navigate("/verify-email", { state: { email: form.email } });
    else navigate("/account");
  }

  return (
    <AuthShell
      title={deployedPlatform === "corporate" ? "Create your IHLink account" : `Create your ${deployedPlatform === "datasub" ? "DataSub" : deployedPlatform === "schoolpro" ? "SchoolPro" : "IHLink service"} account`}
      subtitle={deployedPlatform === "corporate" ? "Choose a service and start your onboarding." : "This registration is for this platform only."}
    >
      {!configured && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 flex gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>
            Registration is temporarily unavailable because the account service is not configured in this deployment.
          </span>
        </div>
      )}
      <form onSubmit={submit} className="grid grid-cols-2 gap-4">
        <Input
          required
          value={form.firstName}
          onChange={(e) => update("firstName", e.target.value)}
          label="First name"
        />
        <Input
          required
          value={form.middleName}
          onChange={(e) => update("middleName", e.target.value)}
          label="Middle name"
        />
        <Input
          required
          value={form.lastName}
          onChange={(e) => update("lastName", e.target.value)}
          label="Surname / last name"
        />
        <Input required value={form.phone} onChange={(e)=>update("phone",e.target.value)} label="Phone number" type="tel"/>
        <Select required value={form.sex} onChange={(e)=>update("sex",e.target.value)} label="Sex" options={[{value:"",label:"Select"},{value:"male",label:"Male"},{value:"female",label:"Female"},{value:"prefer_not_to_say",label:"Prefer not to say"}]}/>
        <div className="col-span-2">
          <Input
            required
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            label="Email address"
            type="email"
          />
        </div>
        {deployedPlatform === "corporate" && (
        <div className="col-span-2">
          <Select
            value={form.service}
            onChange={(e) => update("service", e.target.value)}
            label="I want to"
            options={[
              { value: "explore", label: "Create an IHLink company account" },
              { value: "datasub", label: "Buy data and digital services" },
              { value: "reseller", label: "Become a DataSub reseller" },
              { value: "api", label: "Become a DataSub API developer" },
              { value: "school", label: "Register or manage a school" },
              { value: "consult", label: "Hire IHLink for a project" },
              { value: "host", label: "Buy a domain or hosting plan" },
              { value: "engineering", label: "Request an engineering project" },
              { value: "print", label: "Order Print & Branding services" },
              { value: "fabrication", label: "Request 3D & Fabrication services" },
              { value: "compute", label: "Request AI & Compute services" },
              { value: "academy", label: "Join IHLink Academy" },
              { value: "digital_business", label: "Use Digital Business Centre services" },
            ]}
          />
        </div>
        )}

        <Input
          required
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          label="Password"
          type="password"
        />
        <Input
          required
          value={form.confirm}
          onChange={(e) => update("confirm", e.target.value)}
          label="Confirm password"
          type="password"
        />
        <div className="col-span-2">
          <Checkbox
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            label="I accept the Terms and Privacy Policy"
          />
          <div className="mt-3"><Checkbox checked={newsletterOptIn} onChange={(e)=>setNewsletterOptIn(e.target.checked)} label="Send me IHLink service updates, promotions and newsletters"/></div>
          {error && (
            <p
              role="alert"
              className="text-sm text-rose-600 bg-rose-50 rounded-lg p-3 mt-4"
            >
              {error}
            </p>
          )}
          <Button
            disabled={busy}
            fullWidth
            size="lg"
            className="mt-5"
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            {busy ? "Creating account…" : "Create Account"}
          </Button>
          <p className="text-sm text-center text-muted mt-4">
            Already registered?{" "}
            <Link to="/signin" className="font-bold text-royal-600">
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </AuthShell>
  );
}

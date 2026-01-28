import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Clock } from "lucide-react";

export default function PendingApproval() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-card rounded-2xl p-8 shadow-2xl text-center">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-yellow-100">
              <Clock className="h-12 w-12 text-yellow-600" />
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-2">Registration Pending</h1>
          <p className="text-muted-foreground mb-6">
            Your account is currently pending admin approval. You will be able to login once your account has been verified.
          </p>

          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg text-sm text-left">
              <p className="font-semibold mb-1">What happens next?</p>
              <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                <li>Administrators review new registrations</li>
                <li>This process typically takes 1-2 business days</li>
                <li>You will be notified via email upon approval</li>
              </ul>
            </div>

            <Link
              to="/login"
              className="block w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

import React, { useState } from 'react';
import { useCreatePanelistAccount } from '@/hooks/admin/useAdminPanelists';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, UserPlus, Copy, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface CreateAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  panelistId: string;
  panelistName: string;
  onSuccess?: () => void;
}

export const CreateAccountModal: React.FC<CreateAccountModalProps> = ({
  open,
  onOpenChange,
  panelistId,
  panelistName,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{
    email: string;
    password: string;
  } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const createAccountMutation = useCreatePanelistAccount();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const generatePassword = () => {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setFormData((prev) => ({ ...prev, password }));
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`${field} copied to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const result = await createAccountMutation.mutateAsync({
        panelistId,
        payload: formData,
      });
      setCreatedCredentials({
        email: result.data.credentials.email,
        password: result.data.credentials.temporaryPassword,
      });
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create account:', error);
    }
  };

  const handleClose = () => {
    setFormData({ email: '', password: '', firstName: '', lastName: '', phone: '' });
    setCreatedCredentials(null);
    setShowPassword(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Create Panelist Account
          </DialogTitle>
          <DialogDescription>
            Create login credentials for {panelistName}
          </DialogDescription>
        </DialogHeader>

        {!createdCredentials ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="John"
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="john.doe@example.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+1234567890"
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Password *</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Enter password"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <Button type="button" variant="outline" onClick={generatePassword}>
                  Generate
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Use a strong password or generate one
              </p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createAccountMutation.isPending}
                className="gap-2"
              >
                {createAccountMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Create Account
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800 mb-2">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-semibold">Account Created Successfully!</span>
              </div>
              <p className="text-sm text-green-700">
                Share these credentials with the panelist. They should change their password after first login.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <Label>Email</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    value={createdCredentials.email}
                    readOnly
                    className="flex-1 bg-gray-50"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopy(createdCredentials.email, 'Email')}
                  >
                    {copiedField === 'Email' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <Label>Temporary Password</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    value={createdCredentials.password}
                    readOnly
                    type="text"
                    className="flex-1 bg-gray-50 font-mono"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopy(createdCredentials.password, 'Password')}
                  >
                    {copiedField === 'Password' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800">
                <strong>Important:</strong> Make sure to save these credentials securely. The password will not be shown again.
              </p>
            </div>

            <DialogFooter>
              <Button onClick={handleClose} className="w-full">
                Done
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

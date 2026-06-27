import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';

export const PASSWORD_PATTERN = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-])/;

export const confirmPasswordValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  return control.value.password === control.value.confirmPassword
    ? null
    : { PasswordNoMatch: true };
};

export function createUsernameControl(initialValue = ''): FormControl<string> {
  return new FormControl(initialValue, {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(3), Validators.maxLength(50)],
  });
}

export function createPasswordForm(required: boolean): {
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
  group: FormGroup;
} {
  const requiredValidators = required ? [Validators.required] : [];
  const password = new FormControl('', {
    nonNullable: true,
    validators: [
      ...requiredValidators,
      Validators.minLength(8),
      Validators.maxLength(100),
      Validators.pattern(PASSWORD_PATTERN),
    ],
  });
  const confirmPassword = new FormControl('', {
    nonNullable: true,
    validators: [...requiredValidators, Validators.minLength(8), Validators.maxLength(100)],
  });

  return {
    password,
    confirmPassword,
    group: new FormGroup({ password, confirmPassword }, confirmPasswordValidator),
  };
}

export function readImagePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

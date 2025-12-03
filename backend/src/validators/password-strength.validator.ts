import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isStrongPassword',
      target: object.constructor,
      propertyName: propertyName,
      ...(validationOptions ? { options: validationOptions } : {}),
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') {
            return false;
          }
          // At least 8 characters, one uppercase, one lowercase, one number
          const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
          return strongPasswordRegex.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number';
        },
      },
    });
  };
}


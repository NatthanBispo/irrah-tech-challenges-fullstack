import * as cnpj from '@fnando/cnpj/commonjs';
import * as cpf from '@fnando/cpf/commonjs';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { DocumentType } from '../utils/enums';

@ValidatorConstraint({ name: 'isValidDocument', async: false })
export class IsValidDocumentConstraint implements ValidatorConstraintInterface {
  validate(documentId: string, args: ValidationArguments): boolean {
    const { documentType } = args.object as { documentType?: DocumentType };

    if (!documentType || typeof documentId !== 'string') {
      return false;
    }

    const digits = documentId.replace(/\D/g, '');

    if (documentType === DocumentType.CPF) {
      return cpf.isValid(digits);
    }

    if (documentType === DocumentType.CNPJ) {
      return cnpj.isValid(digits);
    }

    return false;
  }

  defaultMessage(args: ValidationArguments): string {
    const { documentType } = args.object as { documentType?: DocumentType };

    if (documentType === DocumentType.CNPJ) {
      return 'validation.CNPJ_INVALID';
    }

    return 'validation.CPF_INVALID';
  }
}

export function IsValidDocument(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidDocumentConstraint,
    });
  };
}

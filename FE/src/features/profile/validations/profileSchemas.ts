import { z } from 'zod';
import { getProfileCopy } from '../i18n/profileCopy';

export const createUpdateProfileSchema = (language: string | null | undefined) => {
  const copy = getProfileCopy(language);

  const messages = {
    nameMin: copy.validationMessages.nameMin,
    nameMax: copy.validationMessages.nameMax,
    email: copy.validationMessages.email,
    gpaNumber: copy.validationMessages.gpaNumber,
    gpaMin: copy.validationMessages.gpaMin,
    gpaMax: copy.validationMessages.gpaMax,
    completedNumber: copy.validationMessages.completedNumber,
    completedInt: copy.validationMessages.completedInt,
    completedMin: copy.validationMessages.completedMin,
    totalNumber: copy.validationMessages.totalNumber,
    totalInt: copy.validationMessages.totalInt,
    totalMin: copy.validationMessages.totalMin,
    bioMax: copy.validationMessages.bioMax,
    creditsExceed: copy.validationMessages.creditsExceed,
  };

  return z.object({
    name: z
      .string()
      .min(2, { message: messages.nameMin })
      .max(50, { message: messages.nameMax }),
    email: z.string().email({ message: messages.email }),
    studentId: z.string().optional(),
    major: z.string().optional(),
    university: z.string().optional(),
    gpa: z.coerce
      .number({ message: messages.gpaNumber })
      .min(0, { message: messages.gpaMin })
      .max(4, { message: messages.gpaMax })
      .optional(),
    completedCredits: z.coerce
      .number({ message: messages.completedNumber })
      .int({ message: messages.completedInt })
      .min(0, { message: messages.completedMin })
      .optional(),
    totalCredits: z.coerce
      .number({ message: messages.totalNumber })
      .int({ message: messages.totalInt })
      .min(1, { message: messages.totalMin })
      .optional(),
    bio: z.string().max(200, { message: messages.bioMax }).optional(),
  }).refine((data) => {
    if (data.completedCredits !== undefined && data.totalCredits !== undefined) {
      return data.completedCredits <= data.totalCredits;
    }
    return true;
  }, {
    message: messages.creditsExceed,
    path: ['completedCredits'],
  });
};

export type UpdateProfileInput = z.infer<ReturnType<typeof createUpdateProfileSchema>>;

/** @deprecated Use createUpdateProfileSchema(language) for localized validation */
export const updateProfileSchema = createUpdateProfileSchema('vi');

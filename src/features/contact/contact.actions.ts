"use server";

import { contactFormSchema } from "@/features/contact/contact.schemas";
import type { ContactActionState } from "@/features/contact/contact.types";
import { sendContactEmail } from "@/infrastructure/email/smtp-contact-email-sender";

export async function submitContactAction(
  _previousState: ContactActionState,
  formData: FormData,
): Promise<ContactActionState> {
  const parsed = contactFormSchema.safeParse({
    email: formData.get("email"),
    message: formData.get("message"),
    name: formData.get("name"),
    phone: formData.get("phone"),
    website: formData.get("website"),
  });
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "Please correct the highlighted fields.",
      status: "error",
    };
  }
  if (parsed.data.website)
    return { message: "Thank you. We will be in touch soon.", status: "success" };

  try {
    await sendContactEmail(parsed.data);
    return {
      message: "Thank you. Your message has been sent to our marine support team.",
      status: "success",
    };
  } catch (error) {
    console.error("Contact email delivery failed", error);
    return {
      message: "We could not send your message. Please contact us on WhatsApp instead.",
      status: "error",
    };
  }
}

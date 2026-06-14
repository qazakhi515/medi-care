import { Injectable, InternalServerErrorException } from '@nestjs/common';
import OpenAI from 'openai';
import { MedicalAiAnswer } from '../../libs/dto/medical-ai/medical-ai';
import { MedicalAiInput } from '../../libs/dto/medical-ai/medical-ai.input';
import { Specialization } from '../../libs/enums/doctor.enum';
import { MedicalAiUrgencyLevel } from '../../libs/enums/medical-ai.enum';

type MedicalAiJson = {
	answer: string;
	urgencyLevel: MedicalAiUrgencyLevel;
	suggestedSpecialization: Specialization | null;
	shouldBookAppointment: boolean;
	safetyNotice: string;
};

@Injectable()
export class MedicalAiService {
	private client: OpenAI | null = null;

	// OpenRouter (free) is preferred when OPENROUTER_API_KEY is set; falls back to OpenAI otherwise.
	// Both use the OpenAI-compatible Chat Completions API.
	private getClient(): OpenAI {
		const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
		if (!apiKey) {
			throw new InternalServerErrorException('OPENROUTER_API_KEY (or OPENAI_API_KEY) is not configured!');
		}
		if (!this.client) {
			const baseURL = process.env.OPENROUTER_API_KEY
				? 'https://openrouter.ai/api/v1'
				: process.env.OPENAI_BASE_URL || undefined;
			this.client = new OpenAI({
				apiKey,
				baseURL,
				defaultHeaders: { 'X-Title': 'Medi-care' },
			});
		}
		return this.client;
	}

	private getModel(): string {
		return process.env.OPENROUTER_MODEL || process.env.OPENAI_MODEL || 'openai/gpt-oss-120b:free';
	}

	public async askMedicalAi(input: MedicalAiInput): Promise<MedicalAiAnswer> {
		const client = this.getClient();

		try {
			const completion = await client.chat.completions.create({
				model: this.getModel(),
				messages: [
					{ role: 'system', content: this.buildInstructions(input.language) },
					{ role: 'user', content: input.message },
				],
			});

			const content = completion.choices?.[0]?.message?.content || '{}';
			const parsed = this.parseJson(content);

			return {
				answer: parsed.answer,
				urgencyLevel: parsed.urgencyLevel,
				suggestedSpecialization: parsed.suggestedSpecialization || undefined,
				shouldBookAppointment: parsed.shouldBookAppointment,
				safetyNotice: parsed.safetyNotice,
			};
		} catch (err) {
			const status = (err as { status?: number })?.status;
			const apiMessage =
				(err as { error?: { message?: string } })?.error?.message || (err as Error)?.message || 'Unknown error';
			console.error(`MedicalAiService.askMedicalAi error [status=${status ?? 'n/a'}]:`, apiMessage);

			if (status === 429) {
				throw new InternalServerErrorException(
					'Medical AI is unavailable: provider quota or rate limit reached. ' +
						'Free models have daily limits — try again later or switch OPENROUTER_MODEL.',
				);
			}

			throw new InternalServerErrorException(`Medical AI assistant failed: ${apiMessage}`);
		}
	}

	// Free models sometimes wrap JSON in prose or code fences — extract the JSON object safely.
	private parseJson(content: string): MedicalAiJson {
		const start = content.indexOf('{');
		const end = content.lastIndexOf('}');
		const jsonText = start !== -1 && end !== -1 ? content.slice(start, end + 1) : '{}';
		return JSON.parse(jsonText) as MedicalAiJson;
	}

	private buildInstructions(language?: string): string {
		const responseLanguage = language || 'same language as the patient';

		return `
You are Medi-care Medical AI Assistant for a healthcare appointment platform.

Respond in ${responseLanguage}.

Safety rules:
- Do not diagnose the patient.
- Do not prescribe medication, dosage, or treatment plans.
- Do not say that a doctor is unnecessary.
- Give general health information and practical next-step guidance.
- If symptoms may be urgent or dangerous, set urgencyLevel to EMERGENCY and tell the patient to seek emergency care immediately.
- Suggest one suitable doctor specialization when useful.
- Encourage booking an appointment with a qualified doctor when appropriate.
- Keep the answer clear, calm, short, and patient-friendly.

Medi-care specializations:
UROLOGY, DERMATOLOGY, PEDIATRICS, SURGERY, DENTISTRY, CARDIOLOGY, ORTHOPEDICS, OPHTHALMOLOGY, OTHER.

Return ONLY a raw JSON object — no markdown, no code fences, no extra text — with EXACTLY these keys:
{
  "answer": string,
  "urgencyLevel": "LOW" | "MEDIUM" | "HIGH" | "EMERGENCY",
  "suggestedSpecialization": one of the specializations above, or null,
  "shouldBookAppointment": true or false,
  "safetyNotice": string (short disclaimer that this is not a diagnosis)
}
		`;
	}
}

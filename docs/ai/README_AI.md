# Medi-care Medical AI Backend Module

Copy these files into the matching project paths:

```text
apps/medicare-api/src/components/medical-ai/
apps/medicare-api/src/libs/dto/medical-ai/
apps/medicare-api/src/libs/enums/medical-ai.enum.ts
```

Then update:

```ts
// apps/medicare-api/src/components/components.module.ts
import { MedicalAiModule } from './medical-ai/medical-ai.module';

@Module({
  imports: [
    // ...
    MedicalAiModule,
  ],
})
export class ComponentsModule {}
```

Install dependency:

```bash
yarn add openai
```

Environment:

```env
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-5.5
```

GraphQL test:

```graphql
mutation AskMedicalAi($input: MedicalAiInput!) {
  askMedicalAi(input: $input) {
    answer
    urgencyLevel
    suggestedSpecialization
    shouldBookAppointment
    safetyNotice
  }
}
```

Variables:

```json
{
  "input": {
    "message": "Ko'kragim og'riyapti va nafas olishim qiyinlashyapti. Nima qilishim kerak?",
    "language": "uz"
  }
}
```

Use a `PATIENT` JWT token:

```text
Authorization: Bearer {{accessToken}}
```

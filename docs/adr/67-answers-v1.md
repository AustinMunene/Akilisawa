# 67 answers (v1)
Status: adopted (2026-10-09, amended 2026-10-21)
Version: 1.1

The six questions below must appear below the immediately accessible product. Answers use house voice (Akili Sawa/we), British English, sentence case. Each is concise enough to scan in under a minute.

1. What is Sawa?

   Sawa AI is a preventive, non-clinical support companion. Sawa is an AI conversation interface designed to help people reflect, clarify and explore next steps in a safe, bounded space. It is not a replacement for professional care.

2. What can Sawa do?

   Akili Sawa can listen, ask clarifying questions, reflect back what you have shared and help you identify clear next steps. It can also point you towards general information and resources when that is helpful. Its role is to support reflection and navigation, not assessment.

3. What can't Sawa do?

   Akili Sawa cannot diagnose, treat or prescribe medication. It cannot provide emergency care, legal advice or crisis intervention. It is not a therapist, psychiatrist, psychologist or other licensed clinician. If you need urgent care, contact local emergency services or a trusted healthcare provider.

4. When does a human become involved?

   Sawa AI is designed for self-directed reflection. A high-severity signal stops the open-ended reply and shows crisis resources. The flagged message is sent to Akili Sawa's designated support inbox for human review, but the inbox is not monitored for emergencies and no immediate response is guaranteed. You can also choose to connect with a professional.

5. How is information protected?

   Your transcript is held in this browser. Messages are sent to the configured AI provider to generate replies. If a high-severity safety signal is detected, the flagged message is sent to Akili Sawa's designated support inbox; email retention depends on that inbox's settings. The Privacy notice explains the current provider and how your information is handled.

6. How does institutional deployment work?

   Sawa AI can be deployed in organisational settings to support prevention and early navigation. Deployments are configured with clear boundaries, appropriate safeguards and roles. Institutional access is designed to protect individual privacy: organisations see aggregated insights where relevant, never private conversation details.

Notes: The non-clinical disclaimer (preventive, non-clinical; not a therapist/diagnostician) is explicit in answers 1 and 3. Product comes first; these answers come below.

Amendment, 21 October 2026 (ticket 28): answers 4, 5 and 6 now state what the site actually does rather than what it might do. The escalation inbox is configured and receives flagged excerpts, so "may be sent" became "is sent"; the "not monitored for emergencies" caveat is unchanged, because nobody has confirmed staffing. Answer 5 lost the phrase "before real-user use is enabled", which described a pre-launch state the site is no longer in. The copy in `src/lib/sawa/copy.ts` is what ships; this file is the source it is written from.


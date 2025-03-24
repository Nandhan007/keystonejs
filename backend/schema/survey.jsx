// /schema/survey.js
import { list } from '@keystone-6/core';
import { text, relationship, checkbox } from '@keystone-6/core/fields';

export const Survey = list({
  fields: {
    title: text({ validation: { isRequired: true } }),
    description: text({ ui: { displayMode: 'textarea' } }),
    questions: relationship({
      ref: 'Question.survey',
      many: true,
    }),
  },
});

export const Question = list({
  fields: {
    text: text({ validation: { isRequired: true } }),
    type: text({ validation: { isRequired: true }, defaultValue: 'text' }), // E.g., text, checkbox, radio
    options: text({ ui: { displayMode: 'input' } }), // Comma-separated for multiple choice
    survey: relationship({ ref: 'Survey.questions' }),
    required: checkbox({ defaultValue: false }),
  },
});

export const Response = list({
    fields: {
      survey: relationship({ ref: 'Survey' }),
      answers: text({ ui: { displayMode: 'input' } }), // JSON-encoded responses
    },
  });
  
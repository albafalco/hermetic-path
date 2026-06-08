import { Step } from '@/types';

export const STEPS: Step[] = [
  {
    number: 1,
    titleKey: 'steps_data.s1.title',
    overviewKey: 'steps_data.s1.overview',
    duration: '2-4 hét',
    tracks: [
      {
        track: 'spirit',
        titleKey: 'steps_data.s1.spirit_title',
        summaryKey: 'steps_data.s1.spirit_summary',
        masteryNoteKey: 'steps_data.s1.spirit_mastery',
        practices: [
          { key: 's1_spirit_observe', titleKey: 'practices.s1_spirit_observe.title', descriptionKey: 'practices.s1_spirit_observe.description', durationMin: 5, durationMax: 10, frequency: 'both', timerRequired: true },
          { key: 's1_spirit_control', titleKey: 'practices.s1_spirit_control.title', descriptionKey: 'practices.s1_spirit_control.description', durationMin: 5, durationMax: 10, frequency: 'both', timerRequired: true },
          { key: 's1_spirit_emptiness', titleKey: 'practices.s1_spirit_emptiness.title', descriptionKey: 'practices.s1_spirit_emptiness.description', durationMin: 5, durationMax: 10, frequency: 'daily', timerRequired: true },
          { key: 's1_spirit_journal', titleKey: 'practices.s1_spirit_journal.title', descriptionKey: 'practices.s1_spirit_journal.description', durationMin: 5, durationMax: 15, frequency: 'evening', timerRequired: false },
        ],
      },
      {
        track: 'soul',
        titleKey: 'steps_data.s1.soul_title',
        summaryKey: 'steps_data.s1.soul_summary',
        masteryNoteKey: 'steps_data.s1.soul_mastery',
        practices: [
          { key: 's1_soul_introspection', titleKey: 'practices.s1_soul_introspection.title', descriptionKey: 'practices.s1_soul_introspection.description', durationMin: 10, durationMax: 20, frequency: 'both', timerRequired: false },
          { key: 's1_soul_mirror_negative', titleKey: 'practices.s1_soul_mirror_negative.title', descriptionKey: 'practices.s1_soul_mirror_negative.description', durationMin: 15, durationMax: 30, frequency: 'anytime', timerRequired: false },
          { key: 's1_soul_mirror_positive', titleKey: 'practices.s1_soul_mirror_positive.title', descriptionKey: 'practices.s1_soul_mirror_positive.description', durationMin: 15, durationMax: 30, frequency: 'anytime', timerRequired: false },
        ],
      },
      {
        track: 'body',
        titleKey: 'steps_data.s1.body_title',
        summaryKey: 'steps_data.s1.body_summary',
        masteryNoteKey: 'steps_data.s1.body_mastery',
        practices: [
          { key: 's1_body_morning', titleKey: 'practices.s1_body_morning.title', descriptionKey: 'practices.s1_body_morning.description', durationMin: 10, durationMax: 20, frequency: 'morning', timerRequired: false },
          { key: 's1_body_breathing', titleKey: 'practices.s1_body_breathing.title', descriptionKey: 'practices.s1_body_breathing.description', durationMin: 5, durationMax: 15, frequency: 'both', timerRequired: false },
          { key: 's1_body_eating', titleKey: 'practices.s1_body_eating.title', descriptionKey: 'practices.s1_body_eating.description', durationMin: 0, durationMax: 0, frequency: 'daily', timerRequired: false },
          { key: 's1_body_water', titleKey: 'practices.s1_body_water.title', descriptionKey: 'practices.s1_body_water.description', durationMin: 1, durationMax: 5, frequency: 'daily', timerRequired: false },
        ],
      },
    ],
  },
  {
    number: 2,
    titleKey: 'steps_data.s2.title',
    overviewKey: 'steps_data.s2.overview',
    duration: '4-8 hét',
    tracks: [
      {
        track: 'spirit',
        titleKey: 'steps_data.s2.spirit_title',
        summaryKey: 'steps_data.s2.spirit_summary',
        masteryNoteKey: 'steps_data.s2.spirit_mastery',
        practices: [
          { key: 's2_spirit_concentration', titleKey: 'practices.s2_spirit_concentration.title', descriptionKey: 'practices.s2_spirit_concentration.description', durationMin: 5, durationMax: 15, frequency: 'both', timerRequired: true },
          { key: 's2_spirit_multi_sense', titleKey: 'practices.s2_spirit_multi_sense.title', descriptionKey: 'practices.s2_spirit_multi_sense.description', durationMin: 5, durationMax: 10, frequency: 'daily', timerRequired: true },
        ],
      },
      {
        track: 'soul',
        titleKey: 'steps_data.s2.soul_title',
        summaryKey: 'steps_data.s2.soul_summary',
        masteryNoteKey: 'steps_data.s2.soul_mastery',
        practices: [
          { key: 's2_soul_balance', titleKey: 'practices.s2_soul_balance.title', descriptionKey: 'practices.s2_soul_balance.description', durationMin: 10, durationMax: 20, frequency: 'daily', timerRequired: false },
          { key: 's2_soul_character', titleKey: 'practices.s2_soul_character.title', descriptionKey: 'practices.s2_soul_character.description', durationMin: 5, durationMax: 15, frequency: 'both', timerRequired: false },
        ],
      },
      {
        track: 'body',
        titleKey: 'steps_data.s2.body_title',
        summaryKey: 'steps_data.s2.body_summary',
        masteryNoteKey: 'steps_data.s2.body_mastery',
        practices: [
          { key: 's2_body_breathing', titleKey: 'practices.s2_body_breathing.title', descriptionKey: 'practices.s2_body_breathing.description', durationMin: 5, durationMax: 15, frequency: 'both', timerRequired: true },
          { key: 's2_body_posture', titleKey: 'practices.s2_body_posture.title', descriptionKey: 'practices.s2_body_posture.description', durationMin: 0, durationMax: 0, frequency: 'daily', timerRequired: false },
        ],
      },
    ],
  },
  {
    number: 3,
    titleKey: 'steps_data.s3.title',
    overviewKey: 'steps_data.s3.overview',
    duration: '4-8 hét',
    tracks: [
      {
        track: 'spirit',
        titleKey: 'steps_data.s3.spirit_title',
        summaryKey: 'steps_data.s3.spirit_summary',
        masteryNoteKey: 'steps_data.s3.spirit_mastery',
        practices: [
          { key: 's3_spirit_multi', titleKey: 'practices.s3_spirit_multi.title', descriptionKey: 'practices.s3_spirit_multi.description', durationMin: 5, durationMax: 15, frequency: 'both', timerRequired: true },
          { key: 's3_spirit_landscape', titleKey: 'practices.s3_spirit_landscape.title', descriptionKey: 'practices.s3_spirit_landscape.description', durationMin: 5, durationMax: 15, frequency: 'daily', timerRequired: true },
        ],
      },
      {
        track: 'soul',
        titleKey: 'steps_data.s3.soul_title',
        summaryKey: 'steps_data.s3.soul_summary',
        masteryNoteKey: 'steps_data.s3.soul_mastery',
        practices: [
          { key: 's3_soul_elements', titleKey: 'practices.s3_soul_elements.title', descriptionKey: 'practices.s3_soul_elements.description', durationMin: 10, durationMax: 20, frequency: 'both', timerRequired: true },
        ],
      },
      {
        track: 'body',
        titleKey: 'steps_data.s3.body_title',
        summaryKey: 'steps_data.s3.body_summary',
        masteryNoteKey: 'steps_data.s3.body_mastery',
        practices: [
          { key: 's3_body_vitality', titleKey: 'practices.s3_body_vitality.title', descriptionKey: 'practices.s3_body_vitality.description', durationMin: 10, durationMax: 20, frequency: 'both', timerRequired: true },
        ],
      },
    ],
  },
  {
    number: 4,
    titleKey: 'steps_data.s4.title',
    overviewKey: 'steps_data.s4.overview',
    duration: '8-12 hét',
    tracks: [
      {
        track: 'spirit',
        titleKey: 'steps_data.s4.spirit_title',
        summaryKey: 'steps_data.s4.spirit_summary',
        masteryNoteKey: 'steps_data.s4.spirit_mastery',
        practices: [
          { key: 's4_spirit_akasha', titleKey: 'practices.s4_spirit_akasha.title', descriptionKey: 'practices.s4_spirit_akasha.description', durationMin: 10, durationMax: 30, frequency: 'both', timerRequired: true },
        ],
      },
      {
        track: 'soul',
        titleKey: 'steps_data.s4.soul_title',
        summaryKey: 'steps_data.s4.soul_summary',
        masteryNoteKey: 'steps_data.s4.soul_mastery',
        practices: [
          { key: 's4_soul_accumulation', titleKey: 'practices.s4_soul_accumulation.title', descriptionKey: 'practices.s4_soul_accumulation.description', durationMin: 10, durationMax: 20, frequency: 'both', timerRequired: true },
        ],
      },
      {
        track: 'body',
        titleKey: 'steps_data.s4.body_title',
        summaryKey: 'steps_data.s4.body_summary',
        masteryNoteKey: 'steps_data.s4.body_mastery',
        practices: [
          { key: 's4_body_astral_senses', titleKey: 'practices.s4_body_astral_senses.title', descriptionKey: 'practices.s4_body_astral_senses.description', durationMin: 10, durationMax: 20, frequency: 'both', timerRequired: false },
        ],
      },
    ],
  },
  {
    number: 5,
    titleKey: 'steps_data.s5.title',
    overviewKey: 'steps_data.s5.overview',
    duration: '8-16 hét',
    tracks: [
      {
        track: 'spirit',
        titleKey: 'steps_data.s5.spirit_title',
        summaryKey: 'steps_data.s5.spirit_summary',
        masteryNoteKey: 'steps_data.s5.spirit_mastery',
        practices: [
          { key: 's5_spirit_external', titleKey: 'practices.s5_spirit_external.title', descriptionKey: 'practices.s5_spirit_external.description', durationMin: 15, durationMax: 30, frequency: 'both', timerRequired: true },
        ],
      },
      {
        track: 'soul',
        titleKey: 'steps_data.s5.soul_title',
        summaryKey: 'steps_data.s5.soul_summary',
        masteryNoteKey: 'steps_data.s5.soul_mastery',
        practices: [
          { key: 's5_soul_clairvoyance', titleKey: 'practices.s5_soul_clairvoyance.title', descriptionKey: 'practices.s5_soul_clairvoyance.description', durationMin: 10, durationMax: 20, frequency: 'daily', timerRequired: false },
        ],
      },
      {
        track: 'body',
        titleKey: 'steps_data.s5.body_title',
        summaryKey: 'steps_data.s5.body_summary',
        masteryNoteKey: 'steps_data.s5.body_mastery',
        practices: [
          { key: 's5_body_magnetism', titleKey: 'practices.s5_body_magnetism.title', descriptionKey: 'practices.s5_body_magnetism.description', durationMin: 10, durationMax: 20, frequency: 'both', timerRequired: true },
        ],
      },
    ],
  },
  {
    number: 6,
    titleKey: 'steps_data.s6.title',
    overviewKey: 'steps_data.s6.overview',
    duration: '12-20 hét',
    tracks: [
      {
        track: 'spirit',
        titleKey: 'steps_data.s6.spirit_title',
        summaryKey: 'steps_data.s6.spirit_summary',
        masteryNoteKey: 'steps_data.s6.spirit_mastery',
        practices: [
          { key: 's6_spirit_projection', titleKey: 'practices.s6_spirit_projection.title', descriptionKey: 'practices.s6_spirit_projection.description', durationMin: 15, durationMax: 30, frequency: 'both', timerRequired: true },
        ],
      },
      {
        track: 'soul',
        titleKey: 'steps_data.s6.soul_title',
        summaryKey: 'steps_data.s6.soul_summary',
        masteryNoteKey: 'steps_data.s6.soul_mastery',
        practices: [
          { key: 's6_soul_astral_balance', titleKey: 'practices.s6_soul_astral_balance.title', descriptionKey: 'practices.s6_soul_astral_balance.description', durationMin: 15, durationMax: 30, frequency: 'both', timerRequired: true },
        ],
      },
      {
        track: 'body',
        titleKey: 'steps_data.s6.body_title',
        summaryKey: 'steps_data.s6.body_summary',
        masteryNoteKey: 'steps_data.s6.body_mastery',
        practices: [
          { key: 's6_body_room_charging', titleKey: 'practices.s6_body_room_charging.title', descriptionKey: 'practices.s6_body_room_charging.description', durationMin: 10, durationMax: 20, frequency: 'both', timerRequired: true },
        ],
      },
    ],
  },
  {
    number: 7,
    titleKey: 'steps_data.s7.title',
    overviewKey: 'steps_data.s7.overview',
    duration: '16-24 hét',
    tracks: [
      {
        track: 'spirit',
        titleKey: 'steps_data.s7.spirit_title',
        summaryKey: 'steps_data.s7.spirit_summary',
        masteryNoteKey: 'steps_data.s7.spirit_mastery',
        practices: [
          { key: 's7_spirit_letter', titleKey: 'practices.s7_spirit_letter.title', descriptionKey: 'practices.s7_spirit_letter.description', durationMin: 15, durationMax: 45, frequency: 'daily', timerRequired: false },
        ],
      },
      {
        track: 'soul',
        titleKey: 'steps_data.s7.soul_title',
        summaryKey: 'steps_data.s7.soul_summary',
        masteryNoteKey: 'steps_data.s7.soul_mastery',
        practices: [
          { key: 's7_soul_astral_travel', titleKey: 'practices.s7_soul_astral_travel.title', descriptionKey: 'practices.s7_soul_astral_travel.description', durationMin: 20, durationMax: 60, frequency: 'daily', timerRequired: true },
        ],
      },
      {
        track: 'body',
        titleKey: 'steps_data.s7.body_title',
        summaryKey: 'steps_data.s7.body_summary',
        masteryNoteKey: 'steps_data.s7.body_mastery',
        practices: [
          { key: 's7_body_condensers', titleKey: 'practices.s7_body_condensers.title', descriptionKey: 'practices.s7_body_condensers.description', durationMin: 10, durationMax: 20, frequency: 'daily', timerRequired: false },
        ],
      },
    ],
  },
  {
    number: 8,
    titleKey: 'steps_data.s8.title',
    overviewKey: 'steps_data.s8.overview',
    duration: '20-36 hét',
    tracks: [
      {
        track: 'spirit',
        titleKey: 'steps_data.s8.spirit_title',
        summaryKey: 'steps_data.s8.spirit_summary',
        masteryNoteKey: 'steps_data.s8.spirit_mastery',
        practices: [
          { key: 's8_spirit_beings', titleKey: 'practices.s8_spirit_beings.title', descriptionKey: 'practices.s8_spirit_beings.description', durationMin: 20, durationMax: 60, frequency: 'daily', timerRequired: true },
        ],
      },
      {
        track: 'soul',
        titleKey: 'steps_data.s8.soul_title',
        summaryKey: 'steps_data.s8.soul_summary',
        masteryNoteKey: 'steps_data.s8.soul_mastery',
        practices: [
          { key: 's8_soul_intuition', titleKey: 'practices.s8_soul_intuition.title', descriptionKey: 'practices.s8_soul_intuition.description', durationMin: 15, durationMax: 30, frequency: 'daily', timerRequired: true },
        ],
      },
      {
        track: 'body',
        titleKey: 'steps_data.s8.body_title',
        summaryKey: 'steps_data.s8.body_summary',
        masteryNoteKey: 'steps_data.s8.body_mastery',
        practices: [
          { key: 's8_body_influence', titleKey: 'practices.s8_body_influence.title', descriptionKey: 'practices.s8_body_influence.description', durationMin: 15, durationMax: 30, frequency: 'daily', timerRequired: true },
        ],
      },
    ],
  },
  {
    number: 9,
    titleKey: 'steps_data.s9.title',
    overviewKey: 'steps_data.s9.overview',
    duration: '24-48 hét',
    tracks: [
      {
        track: 'spirit',
        titleKey: 'steps_data.s9.spirit_title',
        summaryKey: 'steps_data.s9.spirit_summary',
        masteryNoteKey: 'steps_data.s9.spirit_mastery',
        practices: [
          { key: 's9_spirit_kabbalah', titleKey: 'practices.s9_spirit_kabbalah.title', descriptionKey: 'practices.s9_spirit_kabbalah.description', durationMin: 20, durationMax: 60, frequency: 'daily', timerRequired: true },
        ],
      },
      {
        track: 'soul',
        titleKey: 'steps_data.s9.soul_title',
        summaryKey: 'steps_data.s9.soul_summary',
        masteryNoteKey: 'steps_data.s9.soul_mastery',
        practices: [
          { key: 's9_soul_integration', titleKey: 'practices.s9_soul_integration.title', descriptionKey: 'practices.s9_soul_integration.description', durationMin: 20, durationMax: 45, frequency: 'daily', timerRequired: true },
        ],
      },
      {
        track: 'body',
        titleKey: 'steps_data.s9.body_title',
        summaryKey: 'steps_data.s9.body_summary',
        masteryNoteKey: 'steps_data.s9.body_mastery',
        practices: [
          { key: 's9_body_mastery', titleKey: 'practices.s9_body_mastery.title', descriptionKey: 'practices.s9_body_mastery.description', durationMin: 15, durationMax: 30, frequency: 'daily', timerRequired: false },
        ],
      },
    ],
  },
  {
    number: 10,
    titleKey: 'steps_data.s10.title',
    overviewKey: 'steps_data.s10.overview',
    duration: 'Korlátlan',
    tracks: [
      {
        track: 'spirit',
        titleKey: 'steps_data.s10.spirit_title',
        summaryKey: 'steps_data.s10.spirit_summary',
        masteryNoteKey: 'steps_data.s10.spirit_mastery',
        practices: [
          { key: 's10_spirit_adept', titleKey: 'practices.s10_spirit_adept.title', descriptionKey: 'practices.s10_spirit_adept.description', durationMin: 30, durationMax: 120, frequency: 'daily', timerRequired: true },
        ],
      },
      {
        track: 'soul',
        titleKey: 'steps_data.s10.soul_title',
        summaryKey: 'steps_data.s10.soul_summary',
        masteryNoteKey: 'steps_data.s10.soul_mastery',
        practices: [
          { key: 's10_soul_divine', titleKey: 'practices.s10_soul_divine.title', descriptionKey: 'practices.s10_soul_divine.description', durationMin: 30, durationMax: 60, frequency: 'daily', timerRequired: true },
        ],
      },
      {
        track: 'body',
        titleKey: 'steps_data.s10.body_title',
        summaryKey: 'steps_data.s10.body_summary',
        masteryNoteKey: 'steps_data.s10.body_mastery',
        practices: [
          { key: 's10_body_seal', titleKey: 'practices.s10_body_seal.title', descriptionKey: 'practices.s10_body_seal.description', durationMin: 15, durationMax: 30, frequency: 'daily', timerRequired: false },
        ],
      },
    ],
  },
];

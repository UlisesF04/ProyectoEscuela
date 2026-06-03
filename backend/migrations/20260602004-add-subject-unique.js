'use strict';
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.addConstraint('subjects', {
      fields: ['name', 'course_id'],
      type: 'unique',
      name: 'uq_subjects_name_course'
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeConstraint('subjects', 'uq_subjects_name_course');
  }
};

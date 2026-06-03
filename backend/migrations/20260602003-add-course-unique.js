'use strict';
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.addConstraint('courses', {
      fields: ['name', 'year', 'division'],
      type: 'unique',
      name: 'uq_courses_name_year_division'
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeConstraint('courses', 'uq_courses_name_year_division');
  }
};

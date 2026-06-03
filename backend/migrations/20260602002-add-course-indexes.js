'use strict';
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.addIndex('courses', ['name'], { name: 'idx_courses_name' });
    await queryInterface.addIndex('courses', ['year'], { name: 'idx_courses_year' });
  },
  down: async (queryInterface) => {
    await queryInterface.removeIndex('courses', 'idx_courses_name');
    await queryInterface.removeIndex('courses', 'idx_courses_year');
  }
};

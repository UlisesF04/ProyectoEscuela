'use strict';
module.exports = {
  up: async (queryInterface) => {
    // Evaluate business rules first — may not apply if multiple grades per period are allowed
    // await queryInterface.addConstraint('grades', {
    //   fields: ['student_id', 'subject_id', 'type', 'period'],
    //   type: 'unique',
    //   name: 'uq_grades_student_subject_type_period'
    // });
  },
  down: async () => {}
};

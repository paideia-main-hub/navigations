-- School type is one of three fixed choices. Older free-text values that
-- are not in the list are cleared so the check can be applied; a coordinator
-- picks one of the options the next time they edit the school.

update schools
set school_type = null
where school_type is not null
  and school_type not in (
    'Government',
    'Private with National Curriculum',
    'Private with Oxford Curriculum'
  );

alter table schools drop constraint if exists schools_school_type_check;

alter table schools add constraint schools_school_type_check
  check (
    school_type is null
    or school_type in (
      'Government',
      'Private with National Curriculum',
      'Private with Oxford Curriculum'
    )
  );

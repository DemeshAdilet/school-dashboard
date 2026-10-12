/* Fictional meal roster.
   Everyone in grades 1–4 eats, plus some SUSN pupils from grades 5–11.
   The susn flag stays in the data for a future Dahua filter and is not shown. */
(function () {
  function pupil(id, lastName, firstName, grade, susn) {
    return {
      id: id,
      lastName: lastName,
      firstName: firstName,
      grade: grade,
      susn: susn,
      photo: "assets/avatars/" + id + ".svg",
    };
  }

  window.STUDENTS = [
    pupil("s01", "Нұрланов", "Алихан", "1а", false),
    pupil("s02", "Смағұлова", "Айгерім", "1а", false),
    pupil("s03", "Беков", "Ерасыл", "1а", false),
    pupil("s04", "Қалиева", "Аружан", "1а", false),
    pupil("s05", "Оспанова", "Мадина", "2а", false),
    pupil("s06", "Қайратов", "Нұрсұлтан", "2а", false),
    pupil("s07", "Бекжанова", "Әмина", "2а", false),
    pupil("s08", "Сейітов", "Данияр", "2а", false),
    pupil("s09", "Нұрғалиева", "Аяулым", "3а", false),
    pupil("s10", "Мұратов", "Арсен", "3а", false),
    pupil("s11", "Серікқызы", "Диана", "3а", false),
    pupil("s12", "Жұмабеков", "Тимур", "3а", false),
    pupil("s13", "Ахметова", "Жансая", "4а", false),
    pupil("s14", "Омаров", "Әлібек", "4а", false),
    pupil("s15", "Тұрсын", "Камила", "4а", false),
    pupil("s16", "Төлегенов", "Санжар", "4а", false),
    pupil("s17", "Әбілов", "Мирас", "5б", true),
    pupil("s18", "Есенова", "Назым", "6а", true),
    pupil("s19", "Жүнісова", "Аида", "7ә", true),
    pupil("s20", "Ибраев", "Рамазан", "8а", true),
    pupil("s21", "Рахметова", "Медина", "9б", true),
    pupil("s22", "Сапаров", "Елнұр", "10а", true),
    pupil("s23", "Әлімова", "Сабина", "11а", true),
    pupil("s24", "Қасымов", "Аян", "5ә", true),
  ];
})();

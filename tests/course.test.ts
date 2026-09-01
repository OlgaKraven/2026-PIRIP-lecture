import assert from 'node:assert/strict';
import test from 'node:test';
import { buildDeck } from '../app/course';
import { course } from '../app/course-data';
import { sourcesById } from '../src/data/sourceRegistry';

void test('course has exactly five lectures and five laboratories', () => {
  assert.equal(course.lectures.length, 5); assert.equal(course.laboratories.length, 5);
});

void test('each lecture has 20 content and 25 generated screens', () => {
  for (const lecture of course.lectures) {
    assert.equal(lecture.content.length, 20, lecture.id);
    const slides = buildDeck(lecture, course);
    assert.equal(slides.length, 25, lecture.id);
    assert.equal(slides.filter((slide) => slide.kind === 'content').length, 20, lecture.id);
    assert.equal(slides.filter((slide) => slide.kind === 'service').length, 5, lecture.id);
    assert.ok(course.laboratories.some((lab) => lab.id === lecture.laboratoryId));
    for (const slide of slides) for (const sourceId of slide.sourceIds) assert.ok(sourcesById[sourceId], `${lecture.id}/${slide.id}: unknown ${sourceId}`);
  }
});

void test('laboratories contain required learning support', () => {
  for (const lab of course.laboratories) {
    assert.ok(lab.steps.length >= 5); assert.ok(lab.testCases.length >= 3); assert.ok(lab.recoveryHints.length >= 3);
    assert.ok(course.lectures.some((lecture) => lecture.id === lab.lectureId));
  }
});

void test('course covers KIM tasks 1, 2 and 3 without mandatory slider', () => {
  assert.deepEqual([...new Set(course.lectures.flatMap((lecture) => lecture.kimTasks))].sort((left, right) => left - right), [1, 2, 3]);
  const mandatoryLanguage = course.laboratories.flatMap((lab) => lab.acceptanceCriteria).join(' ').toLocaleLowerCase('ru');
  assert.ok(mandatoryLanguage.includes('слайдер не'));
});

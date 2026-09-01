import type { Course } from './course';
import { lecture01 } from '@/src/data/lectures/lecture01';
import { lecture02 } from '@/src/data/lectures/lecture02';
import { lecture03 } from '@/src/data/lectures/lecture03';
import { lecture04 } from '@/src/data/lectures/lecture04';
import { lecture05 } from '@/src/data/lectures/lecture05';
import { laboratories } from '@/src/data/laboratories';

export const course: Course = {
  id: 'pirip-2027',
  shortTitle: 'ПИРИП · ДЭ 2027',
  title: 'Проектирование и разработка интерфейсов пользователя',
  subtitle: 'Пять лекций и пять лабораторных: от требований КИМ до уверенной демонстрации приложения.',
  audience: 'ПОДГОТОВКА К ДЕМОНСТРАЦИОННОМУ ЭКЗАМЕНУ 2027',
  materialsUrl: 'https://disk.yandex.ru/d/doO6apAunlrARw',
  repositoryUrl: 'https://github.com/OlgaKraven/2026-PIRIP-lecture',
  pagesUrl: 'https://olgakraven.github.io/2026-PIRIP-lecture/',
  lectures: [lecture01, lecture02, lecture03, lecture04, lecture05],
  laboratories,
};

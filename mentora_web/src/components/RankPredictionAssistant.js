import React, { useMemo, useState } from "react";
import {
  AlertCircle,
  BarChart3,
  BookOpenCheck,
  Building2,
  Calculator,
  GraduationCap,
  LineChart,
  RotateCcw,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { apiJson } from "../utils/api";

/*
|--------------------------------------------------------------------------
| تنظیمات اصلی
|--------------------------------------------------------------------------
*/

const FINAL_RECORD_SHARE = 0.6;
const EXAM_SHARE = 0.4;

const MAJORS = ["تجربی", "ریاضی", "انسانی"];
const AREAS = ["منطقه ۱", "منطقه ۲", "منطقه ۳"];

const TRAZ_RANGE_DELTA = 50;

/*
|--------------------------------------------------------------------------
| دروس نهایی دوازدهم
|--------------------------------------------------------------------------
*/

const FINAL_COURSES = {
  تجربی: [
    { name: "فارسی ۳", coefficient: 11.09 },
    { name: "عربی، زبان قرآن ۳", coefficient: 5.37 },
    { name: "دین و زندگی ۳", coefficient: 8.47 },
    { name: "زبان خارجی ۳", coefficient: 6.05 },
    { name: "زیست‌شناسی ۳", coefficient: 11.45 },
    { name: "شیمی ۳", coefficient: 9.19 },
    { name: "فیزیک ۳", coefficient: 8.45 },
    { name: "ریاضی ۳", coefficient: 6.88 },
    { name: "زمین‌شناسی", coefficient: 1.46 },
    { name: "سلامت و بهداشت", coefficient: 1.74 },
    { name: "علوم اجتماعی", coefficient: 1.32 },
  ],

  ریاضی: [
    { name: "فارسی ۳", coefficient: 11.09 },
    { name: "عربی، زبان قرآن ۳", coefficient: 5.37 },
    { name: "دین و زندگی ۳", coefficient: 8.47 },
    { name: "زبان خارجی ۳", coefficient: 6.05 },
    { name: "حسابان ۲", coefficient: 8.45 },
    { name: "هندسه ۳", coefficient: 4.09 },
    { name: "ریاضیات گسسته", coefficient: 4.09 },
    { name: "فیزیک ۳", coefficient: 11.85 },
    { name: "شیمی ۳", coefficient: 9.19 },
    { name: "سلامت و بهداشت", coefficient: 1.74 },
    { name: "هویت اجتماعی", coefficient: 1.32 },
  ],

  انسانی: [
    { name: "فارسی ۳", coefficient: 11.09 },
    { name: "عربی، زبان قرآن ۳", coefficient: 5.37 },
    { name: "دین و زندگی ۳", coefficient: 8.47 },
    { name: "زبان خارجی ۳", coefficient: 6.05 },
    { name: "علوم و فنون ادبی ۳", coefficient: 8.68 },
    { name: "ریاضی و آمار ۳", coefficient: 6.75 },
    { name: "جامعه‌شناسی ۳", coefficient: 4.78 },
    { name: "فلسفه ۲", coefficient: 5.39 },
    { name: "تاریخ ۳", coefficient: 5.39 },
    { name: "جغرافیا ۳", coefficient: 5.39 },
    { name: "روان‌شناسی", coefficient: 5.39 },
    { name: "علوم و معارف قرآنی", coefficient: 2.64 },
    { name: "سلامت و بهداشت", coefficient: 1.74 },
  ],
};

/*
|--------------------------------------------------------------------------
| دروس آزمون اختصاصی
|--------------------------------------------------------------------------
*/

const EXAM_COURSES = {
  تجربی: [
    { name: "زیست‌شناسی", coefficient: 12 },
    { name: "شیمی", coefficient: 9 },
    { name: "فیزیک", coefficient: 7 },
    { name: "ریاضی", coefficient: 7 },
    { name: "زمین‌شناسی", coefficient: 1 },
  ],

  ریاضی: [
    { name: "ریاضیات", coefficient: 12 },
    { name: "فیزیک", coefficient: 9 },
    { name: "شیمی", coefficient: 7 },
  ],

  انسانی: [
    { name: "ریاضی و آمار", coefficient: 6 },
    { name: "زبان و ادبیات فارسی", coefficient: 8 },
    { name: "عربی تخصصی", coefficient: 5 },
    { name: "علوم اجتماعی", coefficient: 5 },
    { name: "فلسفه و منطق", coefficient: 5 },
    { name: "اقتصاد", coefficient: 2 },
    { name: "روان‌شناسی", coefficient: 2 },
    { name: "تاریخ و جغرافیا", coefficient: 5 },
  ],
};

/*
|--------------------------------------------------------------------------
| داده‌های تقریبی آخرین رتبه قبولی در سهمیه
|--------------------------------------------------------------------------
| نکته مهم:
| همه رتبه‌های این بخش «رتبه در سهمیه/منطقه» هستند، نه رتبه کشوری.
|--------------------------------------------------------------------------
*/

const ADMISSION_DATA = {
  تجربی: [
    {
      id: "exp-med-tehran",
      field: "پزشکی",
      university: "دانشگاه علوم پزشکی تهران",
      degree: "دکتری عمومی",
      courseType: "روزانه",
      minRank: { "منطقه ۱": 180, "منطقه ۲": 460, "منطقه ۳": 500 },
      minTraz: { "منطقه ۱": 11450, "منطقه ۲": 11250, "منطقه ۳": 11050 },
      sourceYear: "۱۴۰۲ تا ۱۴۰۳",
      reliability: "بالا",
    },
    {
      id: "exp-med-beheshti",
      field: "پزشکی",
      university: "دانشگاه علوم پزشکی شهید بهشتی",
      degree: "دکتری عمومی",
      courseType: "روزانه",
      minRank: { "منطقه ۱": 260, "منطقه ۲": 620, "منطقه ۳": 690 },
      minTraz: { "منطقه ۱": 11300, "منطقه ۲": 11100, "منطقه ۳": 10900 },
      sourceYear: "۱۴۰۲ تا ۱۴۰۳",
      reliability: "بالا",
    },
    {
      id: "exp-med-iran",
      field: "پزشکی",
      university: "دانشگاه علوم پزشکی ایران",
      degree: "دکتری عمومی",
      courseType: "روزانه",
      minRank: { "منطقه ۱": 340, "منطقه ۲": 780, "منطقه ۳": 850 },
      minTraz: { "منطقه ۱": 11200, "منطقه ۲": 10980, "منطقه ۳": 10800 },
      sourceYear: "۱۴۰۲ تا ۱۴۰۳",
      reliability: "بالا",
    },
    {
      id: "exp-med-mashhad",
      field: "پزشکی",
      university: "دانشگاه علوم پزشکی مشهد",
      degree: "دکتری عمومی",
      courseType: "روزانه",
      minRank: { "منطقه ۱": 620, "منطقه ۲": 1150, "منطقه ۳": 1250 },
      minTraz: { "منطقه ۱": 10950, "منطقه ۲": 10750, "منطقه ۳": 10550 },
      sourceYear: "تخمینی",
      reliability: "متوسط",
    },
    {
      id: "exp-med-shiraz",
      field: "پزشکی",
      university: "دانشگاه علوم پزشکی شیراز",
      degree: "دکتری عمومی",
      courseType: "روزانه",
      minRank: { "منطقه ۱": 700, "منطقه ۲": 1300, "منطقه ۳": 1450 },
      minTraz: { "منطقه ۱": 10880, "منطقه ۲": 10680, "منطقه ۳": 10480 },
      sourceYear: "تخمینی",
      reliability: "متوسط",
    },
    {
      id: "exp-med-isfahan",
      field: "پزشکی",
      university: "دانشگاه علوم پزشکی اصفهان",
      degree: "دکتری عمومی",
      courseType: "روزانه",
      minRank: { "منطقه ۱": 760, "منطقه ۲": 1450, "منطقه ۳": 1650 },
      minTraz: { "منطقه ۱": 10820, "منطقه ۲": 10630, "منطقه ۳": 10420 },
      sourceYear: "تخمینی",
      reliability: "متوسط",
    },
    {
      id: "exp-med-tabriz",
      field: "پزشکی",
      university: "دانشگاه علوم پزشکی تبریز",
      degree: "دکتری عمومی",
      courseType: "روزانه",
      minRank: { "منطقه ۱": 900, "منطقه ۲": 1700, "منطقه ۳": 1950 },
      minTraz: { "منطقه ۱": 10700, "منطقه ۲": 10500, "منطقه ۳": 10300 },
      sourceYear: "تخمینی",
      reliability: "متوسط",
    },
    {
      id: "exp-med-zanjan",
      field: "پزشکی",
      university: "دانشگاه علوم پزشکی زنجان",
      degree: "دکتری عمومی",
      courseType: "روزانه",
      minRank: { "منطقه ۱": 1450, "منطقه ۲": 2600, "منطقه ۳": 3100 },
      minTraz: { "منطقه ۱": 10380, "منطقه ۲": 10150, "منطقه ۳": 9900 },
      sourceYear: "تخمینی",
      reliability: "متوسط",
    },
    {
      id: "exp-dent-tehran",
      field: "دندان‌پزشکی",
      university: "دانشگاه علوم پزشکی تهران",
      degree: "دکتری عمومی",
      courseType: "روزانه",
      minRank: { "منطقه ۱": 310, "منطقه ۲": 690, "منطقه ۳": 760 },
      minTraz: { "منطقه ۱": 11280, "منطقه ۲": 11080, "منطقه ۳": 10880 },
      sourceYear: "۱۴۰۲ تا ۱۴۰۳",
      reliability: "بالا",
    },
    {
      id: "exp-dent-beheshti",
      field: "دندان‌پزشکی",
      university: "دانشگاه علوم پزشکی شهید بهشتی",
      degree: "دکتری عمومی",
      courseType: "روزانه",
      minRank: { "منطقه ۱": 430, "منطقه ۲": 850, "منطقه ۳": 940 },
      minTraz: { "منطقه ۱": 11150, "منطقه ۲": 10970, "منطقه ۳": 10770 },
      sourceYear: "۱۴۰۲ تا ۱۴۰۳",
      reliability: "بالا",
    },
    {
      id: "exp-dent-isfahan",
      field: "دندان‌پزشکی",
      university: "دانشگاه علوم پزشکی اصفهان",
      degree: "دکتری عمومی",
      courseType: "روزانه",
      minRank: { "منطقه ۱": 850, "منطقه ۲": 1500, "منطقه ۳": 1750 },
      minTraz: { "منطقه ۱": 10800, "منطقه ۲": 10600, "منطقه ۳": 10400 },
      sourceYear: "تخمینی",
      reliability: "متوسط",
    },
    {
      id: "exp-pharm-tehran",
      field: "داروسازی",
      university: "دانشگاه علوم پزشکی تهران",
      degree: "دکتری عمومی",
      courseType: "روزانه",
      minRank: { "منطقه ۱": 650, "منطقه ۲": 1200, "منطقه ۳": 1350 },
      minTraz: { "منطقه ۱": 10920, "منطقه ۲": 10720, "منطقه ۳": 10520 },
      sourceYear: "۱۴۰۲ تا ۱۴۰۳",
      reliability: "بالا",
    },
    {
      id: "exp-pharm-tabriz",
      field: "داروسازی",
      university: "دانشگاه علوم پزشکی تبریز",
      degree: "دکتری عمومی",
      courseType: "روزانه",
      minRank: { "منطقه ۱": 1250, "منطقه ۲": 2300, "منطقه ۳": 2700 },
      minTraz: { "منطقه ۱": 10480, "منطقه ۲": 10280, "منطقه ۳": 10080 },
      sourceYear: "تخمینی",
      reliability: "متوسط",
    },
    {
      id: "exp-physio-iran",
      field: "فیزیوتراپی",
      university: "دانشگاه علوم پزشکی ایران",
      degree: "کارشناسی",
      courseType: "روزانه",
      minRank: { "منطقه ۱": 1250, "منطقه ۲": 2200, "منطقه ۳": 2600 },
      minTraz: { "منطقه ۱": 10480, "منطقه ۲": 10250, "منطقه ۳": 10050 },
      sourceYear: "تخمینی",
      reliability: "متوسط",
    },
    {
      id: "exp-nursing-tehran",
      field: "پرستاری",
      university: "دانشگاه علوم پزشکی تهران",
      degree: "کارشناسی",
      courseType: "روزانه",
      minRank: { "منطقه ۱": 6200, "منطقه ۲": 9800, "منطقه ۳": 12500 },
      minTraz: { "منطقه ۱": 8700, "منطقه ۲": 8350, "منطقه ۳": 8050 },
      sourceYear: "تخمینی",
      reliability: "متوسط",
    },
    {
      id: "exp-nursing-zanjan",
      field: "پرستاری",
      university: "دانشگاه علوم پزشکی زنجان",
      degree: "کارشناسی",
      courseType: "روزانه",
      minRank: { "منطقه ۱": 11500, "منطقه ۲": 18500, "منطقه ۳": 25000 },
      minTraz: { "منطقه ۱": 7900, "منطقه ۲": 7500, "منطقه ۳": 7100 },
      sourceYear: "تخمینی",
      reliability: "متوسط",
    },
  ],

  ریاضی: [
    {
      id: "math-cs-sharif",
      field: "مهندسی کامپیوتر",
      university: "دانشگاه صنعتی شریف",
      degree: "کارشناسی",
      courseType: "روزانه",
      minRank: { "منطقه ۱": 160, "منطقه ۲": 120, "منطقه ۳": 90 },
      minTraz: { "منطقه ۱": 11400, "منطقه ۲": 11350, "منطقه ۳": 11250 },
      sourceYear: "۱۴۰۲ تا ۱۴۰۳",
      reliability: "بالا",
    },
    {
      id: "math-cs-tehran",
      field: "مهندسی کامپیوتر",
      university: "دانشگاه تهران",
      degree: "کارشناسی",
      courseType: "روزانه",
      minRank: { "منطقه ۱": 260, "منطقه ۲": 160, "منطقه ۳": 130 },
      minTraz: { "منطقه ۱": 11250, "منطقه ۲": 11200, "منطقه ۳": 11100 },
      sourceYear: "۱۴۰۲ تا ۱۴۰۳",
      reliability: "بالا",
    },
    {
      id: "math-cs-amirkabir",
      field: "مهندسی کامپیوتر",
      university: "دانشگاه صنعتی امیرکبیر",
      degree: "کارشناسی",
      courseType: "روزانه",
      minRank: { "منطقه ۱": 540, "منطقه ۲": 420, "منطقه ۳": 350 },
      minTraz: { "منطقه ۱": 10980, "منطقه ۲": 10920, "منطقه ۳": 10820 },
      sourceYear: "۱۴۰۲ تا ۱۴۰۳",
      reliability: "بالا",
    },
    {
      id: "math-cs-elm-sanat",
      field: "مهندسی کامپیوتر",
      university: "دانشگاه علم و صنعت ایران",
      degree: "کارشناسی",
      courseType: "روزانه",
      minRank: { "منطقه ۱": 850, "منطقه ۲": 680, "منطقه ۳": 560 },
      minTraz: { "منطقه ۱": 10750, "منطقه ۲": 10680, "منطقه ۳": 10580 },
      sourceYear: "تخمینی",
      reliability: "متوسط",
    },
    {
      id: "math-cs-kntu",
      field: "مهندسی کامپیوتر",
      university: "دانشگاه صنعتی خواجه نصیرالدین طوسی",
      degree: "کارشناسی",
      courseType: "روزانه",
      minRank: { "منطقه ۱": 1150, "منطقه ۲": 930, "منطقه ۳": 800 },
      minTraz: { "منطقه ۱": 10580, "منطقه ۲": 10500, "منطقه ۳": 10400 },
      sourceYear: "تخمینی",
      reliability: "متوسط",
    },
    {
      id: "math-cs-shahid-beheshti",
      field: "مهندسی کامپیوتر",
      university: "دانشگاه شهید بهشتی",
      degree: "کارشناسی",
      courseType: "روزانه",
      minRank: { "منطقه ۱": 1450, "منطقه ۲": 1200, "منطقه ۳": 980 },
      minTraz: { "منطقه ۱": 10420, "منطقه ۲": 10350, "منطقه ۳": 10250 },
      sourceYear: "تخمینی",
      reliability: "متوسط",
    },
    {
      id: "math-cs-ferdowsi",
      field: "مهندسی کامپیوتر",
      university: "دانشگاه فردوسی مشهد",
      degree: "کارشناسی",
      courseType: "روزانه",
      minRank: { "منطقه ۱": 2800, "منطقه ۲": 2450, "منطقه ۳": 2200 },
      minTraz: { "منطقه ۱": 9800, "منطقه ۲": 9700, "منطقه ۳": 9600 },
      sourceYear: "تخمینی",
      reliability: "متوسط",
    },
    {
      id: "math-cs-isfahan",
      field: "مهندسی کامپیوتر",
      university: "دانشگاه اصفهان",
      degree: "کارشناسی",
      courseType: "روزانه",
      minRank: { "منطقه ۱": 3500, "منطقه ۲": 3100, "منطقه ۳": 2800 },
      minTraz: { "منطقه ۱": 9500, "منطقه ۲": 9400, "منطقه ۳": 9300 },
      sourceYear: "تخمینی",
      reliability: "متوسط",
    },
    {
      id: "math-cs-tabriz",
      field: "مهندسی کامپیوتر",
      university: "دانشگاه تبریز",
      degree: "کارشناسی",
      courseType: "روزانه",
      minRank: { "منطقه ۱": 4200, "منطقه ۲": 3800, "منطقه ۳": 3400 },
      minTraz: { "منطقه ۱": 9200, "منطقه ۲": 9100, "منطقه ۳": 9000 },
      sourceYear: "تخمینی",
      reliability: "متوسط",
    },
    {
      id: "math-electrical-sharif",
      field: "مهندسی برق",
      university: "دانشگاه صنعتی شریف",
      degree: "کارشناسی",
      courseType: "روزانه",
      minRank: { "منطقه ۱": 420, "منطقه ۲": 320, "منطقه ۳": 250 },
      minTraz: { "منطقه ۱": 11050, "منطقه ۲": 11000, "منطقه ۳": 10900 },
      sourceYear: "تخمینی",
      reliability: "متوسط",
    },
    {
      id: "math-electrical-tehran",
      field: "مهندسی برق",
      university: "دانشگاه تهران",
      degree: "کارشناسی",
      courseType: "روزانه",
      minRank: { "منطقه ۱": 720, "منطقه ۲": 580, "منطقه ۳": 460 },
      minTraz: { "منطقه ۱": 10800, "منطقه ۲": 10750, "منطقه ۳": 10650 },
      sourceYear: "تخمینی",
      reliability: "متوسط",
    },
    {
      id: "math-mech-sharif",
      field: "مهندسی مکانیک",
      university: "دانشگاه صنعتی شریف",
      degree: "کارشناسی",
      courseType: "روزانه",
      minRank: { "منطقه ۱": 620, "منطقه ۲": 500, "منطقه ۳": 390 },
      minTraz: { "منطقه ۱": 10880, "منطقه ۲": 10820, "منطقه ۳": 10720 },
      sourceYear: "تخمینی",
      reliability: "متوسط",
    },
    {
      id: "math-industrial-tehran",
      field: "مهندسی صنایع",
      university: "دانشگاه تهران",
      degree: "کارشناسی",
      courseType: "روزانه",
      minRank: { "منطقه ۱": 1350, "منطقه ۲": 1100, "منطقه ۳": 900 },
      minTraz: { "منطقه ۱": 10480, "منطقه ۲": 10400, "منطقه ۳": 10300 },
      sourceYear: "تخمینی",
      reliability: "متوسط",
    },
    {
      id: "math-civil-tehran",
      field: "مهندسی عمران",
      university: "دانشگاه تهران",
      degree: "کارشناسی",
      courseType: "روزانه",
      minRank: { "منطقه ۱": 2100, "منطقه ۲": 1800, "منطقه ۳": 1500 },
      minTraz: { "منطقه ۱": 10080, "منطقه ۲": 10000, "منطقه ۳": 9900 },
      sourceYear: "تخمینی",
      reliability: "متوسط",
    },
    {
      id: "math-architecture-tehran",
      field: "مهندسی معماری",
      university: "دانشگاه تهران",
      degree: "کارشناسی",
      courseType: "روزانه",
      minRank: { "منطقه ۱": 2400, "منطقه ۲": 2050, "منطقه ۳": 1750 },
      minTraz: { "منطقه ۱": 9950, "منطقه ۲": 9850, "منطقه ۳": 9750 },
      sourceYear: "تخمینی",
      reliability: "متوسط",
    },
  ],

  انسانی: [
    {
      id: "hum-law-tehran",
      field: "حقوق",
      university: "دانشگاه تهران",
      degree: "کارشناسی",
      courseType: "روزانه",
      minRank: { "منطقه ۱": 90, "منطقه ۲": 120, "منطقه ۳": 160 },
      minTraz: { "منطقه ۱": 11250, "منطقه ۲": 11150, "منطقه ۳": 11000 },
      sourceYear: "۱۴۰۲ تا ۱۴۰۳",
      reliability: "بالا",
    },
    {
      id: "hum-law-allameh",
      field: "حقوق",
      university: "دانشگاه علامه طباطبایی",
      degree: "کارشناسی",
      courseType: "روزانه",
      minRank: { "منطقه ۱": 130, "منطقه ۲": 180, "منطقه ۳": 235 },
      minTraz: { "منطقه ۱": 11100, "منطقه ۲": 11000, "منطقه ۳": 10850 },
      sourceYear: "۱۴۰۲ تا ۱۴۰۳",
      reliability: "بالا",
    },
    {
      id: "hum-law-beheshti",
      field: "حقوق",
      university: "دانشگاه شهید بهشتی",
      degree: "کارشناسی",
      courseType: "روزانه",
      minRank: { "منطقه ۱": 210, "منطقه ۲": 300, "منطقه ۳": 390 },
      minTraz: { "منطقه ۱": 10950, "منطقه ۲": 10850, "منطقه ۳": 10700 },
      sourceYear: "تخمینی",
      reliability: "متوسط",
    },
    {
      id: "hum-law-kharazmi",
      field: "حقوق",
      university: "دانشگاه خوارزمی",
      degree: "کارشناسی",
      courseType: "روزانه",
      minRank: { "منطقه ۱": 620, "منطقه ۲": 850, "منطقه ۳": 1100 },
      minTraz: { "منطقه ۱": 10450, "منطقه ۲": 10350, "منطقه ۳": 10200 },
      sourceYear: "تخمینی",
      reliability: "متوسط",
    },
    {
      id: "hum-psychology-tehran",
      field: "روان‌شناسی",
      university: "دانشگاه تهران",
      degree: "کارشناسی",
      courseType: "روزانه",
      minRank: { "منطقه ۱": 280, "منطقه ۲": 420, "منطقه ۳": 560 },
      minTraz: { "منطقه ۱": 10850, "منطقه ۲": 10750, "منطقه ۳": 10600 },
      sourceYear: "تخمینی",
      reliability: "متوسط",
    },
    {
      id: "hum-psychology-allameh",
      field: "روان‌شناسی",
      university: "دانشگاه علامه طباطبایی",
      degree: "کارشناسی",
      courseType: "روزانه",
      minRank: { "منطقه ۱": 380, "منطقه ۲": 550, "منطقه ۳": 750 },
      minTraz: { "منطقه ۱": 10700, "منطقه ۲": 10600, "منطقه ۳": 10450 },
      sourceYear: "تخمینی",
      reliability: "متوسط",
    },
    {
      id: "hum-management-tehran",
      field: "مدیریت بازرگانی",
      university: "دانشگاه تهران",
      degree: "کارشناسی",
      courseType: "روزانه",
      minRank: { "منطقه ۱": 750, "منطقه ۲": 1050, "منطقه ۳": 1350 },
      minTraz: { "منطقه ۱": 10350, "منطقه ۲": 10250, "منطقه ۳": 10100 },
      sourceYear: "تخمینی",
      reliability: "متوسط",
    },
    {
      id: "hum-accounting-tehran",
      field: "حسابداری",
      university: "دانشگاه تهران",
      degree: "کارشناسی",
      courseType: "روزانه",
      minRank: { "منطقه ۱": 950, "منطقه ۲": 1350, "منطقه ۳": 1750 },
      minTraz: { "منطقه ۱": 10180, "منطقه ۲": 10080, "منطقه ۳": 9900 },
      sourceYear: "تخمینی",
      reliability: "متوسط",
    },
    {
      id: "hum-economics-tehran",
      field: "اقتصاد",
      university: "دانشگاه تهران",
      degree: "کارشناسی",
      courseType: "روزانه",
      minRank: { "منطقه ۱": 820, "منطقه ۲": 1150, "منطقه ۳": 1500 },
      minTraz: { "منطقه ۱": 10280, "منطقه ۲": 10180, "منطقه ۳": 10020 },
      sourceYear: "تخمینی",
      reliability: "متوسط",
    },
    {
      id: "hum-sociology-tehran",
      field: "جامعه‌شناسی",
      university: "دانشگاه تهران",
      degree: "کارشناسی",
      courseType: "روزانه",
      minRank: { "منطقه ۱": 1600, "منطقه ۲": 2300, "منطقه ۳": 3100 },
      minTraz: { "منطقه ۱": 9700, "منطقه ۲": 9550, "منطقه ۳": 9350 },
      sourceYear: "تخمینی",
      reliability: "متوسط",
    },
    {
      id: "hum-education-farhangian",
      field: "آموزش ابتدایی",
      university: "دانشگاه فرهنگیان",
      degree: "کارشناسی",
      courseType: "فرهنگیان",
      minRank: { "منطقه ۱": 4500, "منطقه ۲": 6500, "منطقه ۳": 8500 },
      minTraz: { "منطقه ۱": 8900, "منطقه ۲": 8600, "منطقه ۳": 8300 },
      sourceYear: "تخمینی",
      reliability: "متوسط",
    },
  ],
};

/*
|--------------------------------------------------------------------------
| داده تقریبی فرهنگیان
|--------------------------------------------------------------------------
| این بخش تخمین دعوت به ارزیابی است، نه قبولی قطعی.
|--------------------------------------------------------------------------
*/

const FARHANGIAN_DATA = {
  تجربی: {
    "منطقه ۱": { minRank: 5000, maxRank: 10000 },
    "منطقه ۲": { minRank: 8000, maxRank: 14000 },
    "منطقه ۳": { minRank: 10000, maxRank: 20000 },
  },

  ریاضی: {
    "منطقه ۱": { minRank: 6000, maxRank: 12000 },
    "منطقه ۲": { minRank: 9000, maxRank: 16000 },
    "منطقه ۳": { minRank: 12000, maxRank: 22000 },
  },

  انسانی: {
    "منطقه ۱": { minRank: 4000, maxRank: 9000 },
    "منطقه ۲": { minRank: 6000, maxRank: 12000 },
    "منطقه ۳": { minRank: 8000, maxRank: 18000 },
  },
};

/*
|--------------------------------------------------------------------------
| توابع کمکی
|--------------------------------------------------------------------------
*/

const createValues = (courses, defaultValue) => {
  return Object.fromEntries(
    courses.map((course) => [course.name, defaultValue]),
  );
};

const clamp = (value, min, max, fallback = min) => {
  const number = Number(value);

  if (Number.isNaN(number)) {
    return fallback;
  }

  return Math.min(Math.max(number, min), max);
};

const formatNumber = (value) => {
  return Math.round(Number(value || 0)).toLocaleString("fa-IR");
};

const formatDecimal = (value) => {
  return Number(value || 0).toLocaleString("fa-IR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  });
};

const formatRange = (min, max) => {
  return `از ${formatNumber(min)} تا ${formatNumber(max)}`;
};

const createTrazRange = (center, delta = TRAZ_RANGE_DELTA) => {
  return {
    min: Math.round(center - delta),
    max: Math.round(center + delta),
  };
};

const createRankRange = (center, type = "country") => {
  const rank = Math.max(1, Number(center || 1));

  let min;
  let max;

  if (type === "quota") {
    min = Math.round(rank * 0.8);
    max = Math.round(rank * 1.08);
  } else {
    min = Math.round(rank * 0.85);
    max = Math.round(rank * 1.15);
  }

  return {
    min: Math.max(1, min),
    max: Math.max(1, max),
  };
};

/*
|--------------------------------------------------------------------------
| محاسبه معدل وزنی
|--------------------------------------------------------------------------
*/

const calculateWeightedAverage = (courses, scores) => {
  const totalCoefficient = courses.reduce(
    (sum, course) => sum + course.coefficient,
    0,
  );

  if (!totalCoefficient) {
    return 0;
  }

  const weightedSum = courses.reduce((sum, course) => {
    const score = Number(scores?.[course.name] || 0);

    return sum + score * course.coefficient;
  }, 0);

  return weightedSum / totalCoefficient;
};

/*
|--------------------------------------------------------------------------
| مدل تبدیل معدل به تراز سوابق
|--------------------------------------------------------------------------
*/

const FINAL_AVERAGE_TRAZ_MODEL = {
  تجربی: {
    minAverage: 10,
    maxAverage: 20,
    minTraz: 4300,
    maxTraz: 10180,
    curve: 1.02,
  },

  ریاضی: {
    minAverage: 10,
    maxAverage: 20,
    minTraz: 4300,
    maxTraz: 10140,
    curve: 1.02,
  },

  انسانی: {
    minAverage: 10,
    maxAverage: 20,
    minTraz: 4200,
    maxTraz: 10050,
    curve: 1.02,
  },
};

const finalAverageToTraz = (average, major) => {
  const model = FINAL_AVERAGE_TRAZ_MODEL[major];

  const normalized =
    (Number(average || 0) - model.minAverage) /
    (model.maxAverage - model.minAverage);

  const bounded = Math.min(Math.max(normalized, 0), 1);
  const curved = Math.pow(bounded, model.curve);

  return Math.round(model.minTraz + curved * (model.maxTraz - model.minTraz));
};

/*
|--------------------------------------------------------------------------
| مدل تبدیل درصد کنکور به تراز آزمون
|--------------------------------------------------------------------------
*/

const EXAM_PERCENT_TRAZ_MODEL = {
  تجربی: {
    base: 6500,
    slope: 72,
    minTraz: 2500,
    maxTraz: 13000,
  },

  ریاضی: {
    base: 6500,
    slope: 72.4,
    minTraz: 2500,
    maxTraz: 13000,
  },

  انسانی: {
    base: 6400,
    slope: 70,
    minTraz: 2500,
    maxTraz: 13000,
  },
};

const examPercentToTraz = (percent, major) => {
  const model = EXAM_PERCENT_TRAZ_MODEL[major];

  const rawTraz = model.base + Number(percent || 0) * model.slope;

  return Math.round(Math.min(Math.max(rawTraz, model.minTraz), model.maxTraz));
};

const calculateExamTraz = (major, courses, percentages) => {
  const totalCoefficient = courses.reduce(
    (sum, course) => sum + course.coefficient,
    0,
  );

  if (!totalCoefficient) {
    return 0;
  }

  const weightedTraz = courses.reduce((sum, course) => {
    const percent = Number(percentages?.[course.name] || 0);
    const traz = examPercentToTraz(percent, major);

    return sum + traz * course.coefficient;
  }, 0);

  return Math.round(weightedTraz / totalCoefficient);
};

/*
|--------------------------------------------------------------------------
| مدل رتبه کشوری و سهمیه
|--------------------------------------------------------------------------
*/

const estimateCountryRank = (totalTraz, major) => {
  const majorModels = {
    تجربی: {
      scale: 7000000,
      power: 8.2,
      factor: 1.35,
    },

    ریاضی: {
      scale: 2100000,
      power: 8,
      factor: 1,
    },

    انسانی: {
      scale: 1800000,
      power: 7.6,
      factor: 0.95,
    },
  };

  const model = majorModels[major];

  const normalized = Math.min(
    Math.max((13000 - Number(totalTraz || 0)) / 8500, 0.02),
    1,
  );

  const rank = model.scale * Math.pow(normalized, model.power) * model.factor;

  return Math.max(1, Math.round(rank));
};

const estimateQuotaRank = (countryRank, area) => {
  const areaFactor =
    {
      "منطقه ۱": 0.38,
      "منطقه ۲": 0.34,
      "منطقه ۳": 0.42,
    }[area] || 0.36;

  return Math.max(1, Math.round(Number(countryRank || 1) * areaFactor));
};

/*
|--------------------------------------------------------------------------
| منطق رشته و دانشگاه‌های احتمالی
|--------------------------------------------------------------------------
*/

const getAdmissionRank = (item, area) => {
  return item.minRank?.[area] || null;
};

const getAdmissionTraz = (item, area) => {
  return item.minTraz?.[area] || null;
};

const getAdmissionStatus = ({
  userRank,
  userTraz,
  requiredRank,
  requiredTraz,
}) => {
  if (!requiredRank || !requiredTraz) {
    return {
      key: "unknown",
      label: "داده ناکافی",
      color: "#7C8683",
      background: "#F7F6F1",
      border: "#E3E1D8",
      score: 0,
    };
  }

  const rankRatio = userRank / requiredRank;
  const trazDifference = userTraz - requiredTraz;

  if (rankRatio <= 0.8 && trazDifference >= 150) {
    return {
      key: "high",
      label: "شانس بالا",
      color: "#247147",
      background: "#DFF0E6",
      border: "#a7f3d0",
      score: 4,
    };
  }

  if (rankRatio <= 1 && trazDifference >= -100) {
    return {
      key: "reasonable",
      label: "شانس منطقی",
      color: "#15803d",
      background: "#f0fdf4",
      border: "#CBE7D6",
      score: 3,
    };
  }

  if (rankRatio <= 1.3 && trazDifference >= -500) {
    return {
      key: "borderline",
      label: "مرزی",
      color: "#A9741B",
      background: "#F7ECD8",
      border: "#EFE0B8",
      score: 2,
    };
  }

  return {
    key: "low",
    label: "شانس پایین",
    color: "#b91c1c",
    background: "#F9E3E3",
    border: "#F0C9C9",
    score: 1,
  };
};

const calculateAdmissionProbability = ({
  userRank,
  userTraz,
  requiredRank,
  requiredTraz,
}) => {
  if (!requiredRank || !requiredTraz) {
    return 0;
  }

  /*
  رتبه کمتر بهتر است.
  اگر userRank نصف requiredRank باشد، وضعیت خیلی خوب است.
  اگر برابر requiredRank باشد، مرزی/منطقی است.
  اگر خیلی بالاتر باشد، شانس کم می‌شود.
  */

  const rankRatio = userRank / requiredRank;
  const trazDifference = userTraz - requiredTraz;

  let rankScore = 0;

  if (rankRatio <= 0.55) {
    rankScore = 100;
  } else if (rankRatio <= 0.7) {
    rankScore = 92;
  } else if (rankRatio <= 0.85) {
    rankScore = 82;
  } else if (rankRatio <= 1) {
    rankScore = 68;
  } else if (rankRatio <= 1.15) {
    rankScore = 52;
  } else if (rankRatio <= 1.3) {
    rankScore = 38;
  } else if (rankRatio <= 1.6) {
    rankScore = 22;
  } else if (rankRatio <= 2) {
    rankScore = 10;
  } else {
    rankScore = 4;
  }

  /*
  امتیاز تراز:
  تراز بالاتر از حد موردنیاز احتمال را تقویت می‌کند.
  تراز پایین‌تر احتمال را کم می‌کند.
  */

  let trazAdjustment = 0;

  if (trazDifference >= 700) {
    trazAdjustment = 10;
  } else if (trazDifference >= 400) {
    trazAdjustment = 7;
  } else if (trazDifference >= 150) {
    trazAdjustment = 4;
  } else if (trazDifference >= -100) {
    trazAdjustment = 0;
  } else if (trazDifference >= -300) {
    trazAdjustment = -8;
  } else if (trazDifference >= -600) {
    trazAdjustment = -16;
  } else {
    trazAdjustment = -25;
  }

  const probability = rankScore + trazAdjustment;

  return Math.round(Math.min(Math.max(probability, 1), 99));
};
const calculateSelectedAdmissionResult = ({
  selectedAdmissionId,
  major,
  area,
  quotaRank,
  totalTraz,
}) => {
  if (!selectedAdmissionId) {
    return null;
  }

  const selectedItem = ADMISSION_DATA[major]?.find(
    (item) => item.id === selectedAdmissionId,
  );

  if (!selectedItem) {
    return null;
  }

  const requiredRank = getAdmissionRank(selectedItem, area);
  const requiredTraz = getAdmissionTraz(selectedItem, area);

  const status = getAdmissionStatus({
    userRank: quotaRank,
    userTraz: totalTraz,
    requiredRank,
    requiredTraz,
  });

  const probability = calculateAdmissionProbability({
    userRank: quotaRank,
    userTraz: totalTraz,
    requiredRank,
    requiredTraz,
  });

  const rankDifference = quotaRank - requiredRank;
  const trazDifference = totalTraz - requiredTraz;

  return {
    ...selectedItem,
    requiredRank,
    requiredTraz,
    status,
    probability,
    rankDifference,
    trazDifference,
  };
};

const calculateAdmissionOptions = ({ major, area, quotaRank, totalTraz }) => {
  const data = ADMISSION_DATA[major] || [];

  return data
    .map((item) => {
      const requiredRank = getAdmissionRank(item, area);
      const requiredTraz = getAdmissionTraz(item, area);

      const status = getAdmissionStatus({
        userRank: quotaRank,
        userTraz: totalTraz,
        requiredRank,
        requiredTraz,
      });

      return {
        ...item,
        requiredRank,
        requiredTraz,
        status,
      };
    })
    .sort((a, b) => {
      if (b.status.score !== a.status.score) {
        return b.status.score - a.status.score;
      }

      return (a.requiredRank || Infinity) - (b.requiredRank || Infinity);
    });
};

const calculateFarhangianChance = ({ major, area, quotaRank }) => {
  const limits = FARHANGIAN_DATA[major]?.[area];

  if (!limits) {
    return {
      key: "unknown",
      label: "اطلاعات کافی نیست",
      color: "#7C8683",
      background: "#F7F6F1",
      border: "#E3E1D8",
    };
  }

  if (quotaRank <= limits.minRank) {
    return {
      key: "high",
      label: "شانس مناسب برای دعوت به ارزیابی",
      color: "#247147",
      background: "#DFF0E6",
      border: "#a7f3d0",
    };
  }

  if (quotaRank <= limits.maxRank) {
    return {
      key: "borderline",
      label: "شانس مرزی برای دعوت به ارزیابی",
      color: "#A9741B",
      background: "#F7ECD8",
      border: "#EFE0B8",
    };
  }

  return {
    key: "low",
    label: "شانس پایین بر اساس رتبه",
    color: "#b91c1c",
    background: "#F9E3E3",
    border: "#F0C9C9",
  };
};

/*
|--------------------------------------------------------------------------
| محاسبه نهایی
|--------------------------------------------------------------------------
*/

const calculatePrediction = ({
  major,
  area,
  finalScores,
  examPercents,
  useDirectAverage,
  directAverage,
}) => {
  const finalCourses = FINAL_COURSES[major];
  const examCourses = EXAM_COURSES[major];

  const calculatedFinalAverage = calculateWeightedAverage(
    finalCourses,
    finalScores,
  );

  const finalAverage = useDirectAverage
    ? clamp(directAverage, 0, 20, calculatedFinalAverage)
    : calculatedFinalAverage;

  const finalRecordTraz = finalAverageToTraz(finalAverage, major);

  const examTraz = calculateExamTraz(major, examCourses, examPercents);

  const totalTraz =
    finalRecordTraz * FINAL_RECORD_SHARE + examTraz * EXAM_SHARE;

  const estimatedCountryRank = estimateCountryRank(totalTraz, major);
  const estimatedQuotaRank = estimateQuotaRank(estimatedCountryRank, area);

  const finalRecordTrazRange = createTrazRange(finalRecordTraz);
  const examTrazRange = createTrazRange(examTraz);
  const totalTrazRange = createTrazRange(totalTraz);

  const countryRankRange = createRankRange(estimatedCountryRank, "country");

  const quotaRankRange = createRankRange(estimatedQuotaRank, "quota");

  const admissionOptions = calculateAdmissionOptions({
    major,
    area,
    quotaRank: estimatedQuotaRank,
    totalTraz,
  });

  const farhangianChance = calculateFarhangianChance({
    major,
    area,
    quotaRank: estimatedQuotaRank,
  });

  return {
    calculatedFinalAverage,
    finalAverage,

    finalRecordTraz,
    examTraz,
    totalTraz,

    finalRecordTrazRange,
    examTrazRange,
    totalTrazRange,

    estimatedCountryRank,
    estimatedQuotaRank,

    countryRankRange,
    quotaRankRange,

    admissionOptions,
    farhangianChance,
  };
};

/*
|--------------------------------------------------------------------------
| کامپوننت اصلی
|--------------------------------------------------------------------------
*/

export default function RankPredictionAssistant() {
  const [major, setMajor] = useState("ریاضی");
  const [area, setArea] = useState("منطقه ۲");
  const [showResult, setShowResult] = useState(false);
  const [selectedAdmissionId, setSelectedAdmissionId] = useState("");
  const [saveStatus, setSaveStatus] = useState("");

  const [useDirectAverage, setUseDirectAverage] = useState(false);
  const [directAverage, setDirectAverage] = useState(18.91);

  const [finalScores, setFinalScores] = useState(() =>
    createValues(FINAL_COURSES.ریاضی, 18),
  );

  const [examPercents, setExamPercents] = useState(() =>
    createValues(EXAM_COURSES.ریاضی, 35),
  );

  const finalCourses = FINAL_COURSES[major];
  const examCourses = EXAM_COURSES[major];

  const prediction = useMemo(() => {
    return calculatePrediction({
      major,
      area,
      finalScores,
      examPercents,
      useDirectAverage,
      directAverage,
    });
  }, [major, area, finalScores, examPercents, useDirectAverage, directAverage]);
  const admissionSelectOptions = useMemo(() => {
    return (ADMISSION_DATA[major] || []).map((item) => ({
      value: item.id,
      label: `${item.field} - ${item.university}`,
    }));
  }, [major]);

  const selectedAdmissionResult = useMemo(() => {
    return calculateSelectedAdmissionResult({
      selectedAdmissionId,
      major,
      area,
      quotaRank: prediction.estimatedQuotaRank,
      totalTraz: prediction.totalTraz,
    });
  }, [
    selectedAdmissionId,
    major,
    area,
    prediction.estimatedQuotaRank,
    prediction.totalTraz,
  ]);

  const handleMajorChange = (nextMajor) => {
    setMajor(nextMajor);
    setSelectedAdmissionId("");
    setFinalScores(createValues(FINAL_COURSES[nextMajor], 18));
    setExamPercents(createValues(EXAM_COURSES[nextMajor], 35));
    setShowResult(false);
  };

  const updateFinalScore = (courseName, value) => {
    setFinalScores((previous) => ({
      ...previous,
      [courseName]: clamp(value, 0, 20, previous[courseName] || 0),
    }));

    setShowResult(false);
  };

  const updateExamPercent = (courseName, value) => {
    setExamPercents((previous) => ({
      ...previous,
      [courseName]: clamp(value, -33.33, 100, previous[courseName] || 0),
    }));

    setShowResult(false);
  };

  const handleReset = () => {
    setUseDirectAverage(false);
    setDirectAverage(18.91);
    setFinalScores(createValues(finalCourses, 18));
    setExamPercents(createValues(examCourses, 35));
    setShowResult(false);
    setSaveStatus("");
  };

  const handleCalculate = async () => {
    setShowResult(true);
    setSaveStatus("در حال ذخیره این تخمین...");

    const result = {
      finalAverage: prediction.finalAverage,
      finalRecordTraz: prediction.finalRecordTraz,
      examTraz: prediction.examTraz,
      totalTraz: prediction.totalTraz,
      estimatedCountryRank: prediction.estimatedCountryRank,
      estimatedQuotaRank: prediction.estimatedQuotaRank,
      finalRecordTrazRange: prediction.finalRecordTrazRange,
      examTrazRange: prediction.examTrazRange,
      totalTrazRange: prediction.totalTrazRange,
      countryRankRange: prediction.countryRankRange,
      quotaRankRange: prediction.quotaRankRange,
    };

    try {
      const { response } = await apiJson("/api/prediction/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          major,
          area,
          finalScores,
          examPercentages: examPercents,
          useDirectAverage,
          directAverage,
          result,
        }),
      });
      setSaveStatus(response.ok ? "این تخمین در سابقه شما ذخیره شد." : "تخمین نمایش داده شد، اما ذخیره نشد.");
    } catch {
      setSaveStatus("تخمین نمایش داده شد، اما ذخیره نشد.");
    }

    window.setTimeout(() => {
      document.getElementById("prediction-result")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  return (
    <>
      <Helmet>
        <title>محاسبه معدل نهایی و تخمین رتبه کنکور | منتورا</title>

        <meta
          name="description"
          content="محاسبه معدل کتبی نهایی، تراز سوابق، تراز آزمون اختصاصی، تراز کل و رتبه تخمینی کنکور."
        />
      </Helmet>

      <main className="container py-4" style={pageStyle}>
        <div className="d-flex flex-column gap-4">
          <SectionCard>
            <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
              <div className="d-flex align-items-start gap-3">
                <div style={iconBadgeStyle}>
                  <Calculator size={22} />
                </div>

                <div>
                  <h1 className="fw-bold mb-2" style={titleStyle}>
                    محاسبه معدل نهایی و تخمین رتبه کنکور
                  </h1>

                  <p className="text-muted mb-0" style={paragraphStyle}>
                    نمرات نهایی یا معدل کتبی دوازدهم و درصدهای کنکور را وارد
                    کنید تا تراز سوابق، تراز آزمون، تراز کل و رتبه تخمینی محاسبه
                    شود.
                  </p>
                </div>
              </div>

              <div className="d-flex gap-2 flex-wrap">
                <StatBadge label="سوابق تحصیلی" value="۶۰٪" color="#247147" />
                <StatBadge label="آزمون اختصاصی" value="۴۰٪" color="#2E7F81" />
              </div>
            </div>

            <div className="mt-3">
              <AlertBox message="این ابزار برای تخمین و تصمیم‌سازی اولیه است. رتبه و قبولی رسمی فقط با داده‌های واقعی سازمان سنجش و دفترچه انتخاب رشته همان سال مشخص می‌شود." />
            </div>
          </SectionCard>

          <SectionCard>
            <SectionHeader
              icon={<Target size={16} color="#2E7F81" />}
              title="اطلاعات رشته"
              description="با انتخاب رشته، فهرست درس‌ها و ضرایب همان رشته نمایش داده می‌شود."
            />

            <div className="row g-3">
              <div className="col-12 col-md-6">
                <SelectField
                  label="رشته تحصیلی"
                  value={major}
                  options={MAJORS}
                  onChange={handleMajorChange}
                />
              </div>

              <div className="col-12 col-md-6">
                <SelectField
                  label="منطقه"
                  value={area}
                  options={AREAS}
                  onChange={(value) => {
                    setArea(value);
                    setShowResult(false);
                  }}
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard>
            <SectionHeader
              icon={<BookOpenCheck size={16} color="#2E7F81" />}
              title="معدل یا نمرات نهایی دوازدهم"
              description="اگر معدل کتبی دقیق دارید، مستقیم وارد کنید؛ در غیر این صورت از نمرات درس‌ها محاسبه می‌شود."
            />

            <div style={toggleBoxStyle} className="mb-3">
              <label className="d-flex align-items-center gap-2 mb-0">
                <input
                  type="checkbox"
                  checked={useDirectAverage}
                  onChange={(event) => {
                    setUseDirectAverage(event.target.checked);
                    setShowResult(false);
                  }}
                />

                <span className="fw-bold" style={{ fontSize: "12px" }}>
                  معدل کتبی نهایی را مستقیم وارد می‌کنم
                </span>
              </label>
            </div>

            {useDirectAverage ? (
              <div className="row g-3">
                <div className="col-12 col-md-4">
                  <NumberField
                    label="معدل کتبی نهایی"
                    value={directAverage}
                    min={0}
                    max={20}
                    step="0.01"
                    suffix="از ۲۰"
                    onChange={(value) => {
                      setDirectAverage(clamp(value, 0, 20, directAverage));
                      setShowResult(false);
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="row g-3">
                {finalCourses.map((course) => (
                  <div className="col-12 col-sm-6 col-lg-4" key={course.name}>
                    <NumberField
                      label={course.name}
                      value={finalScores[course.name]}
                      min={0}
                      max={20}
                      step="0.25"
                      suffix={`ضریب ${course.coefficient}`}
                      onChange={(value) => updateFinalScore(course.name, value)}
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4">
              <ScoreSummaryCard
                title={
                  useDirectAverage
                    ? "معدل کتبی نهایی واردشده"
                    : "معدل کتبی نهایی محاسبه‌شده"
                }
                value={`${formatDecimal(prediction.finalAverage)} از ۲۰`}
                description={
                  useDirectAverage
                    ? "این معدل مستقیماً در محاسبه تراز سوابق استفاده می‌شود."
                    : "معدل بر اساس مجموع نمره هر درس ضربدر ضریب همان درس محاسبه شده است."
                }
                color="#247147"
                background="#DFF0E6"
                border="#d1fae5"
              />
            </div>
          </SectionCard>

          <SectionCard>
            <SectionHeader
              icon={<BarChart3 size={16} color="#2E7F81" />}
              title="درصدهای کنکور خود را وارد کنید"
              description="درصدها را بین منفی ۳۳٫۳۳ تا مثبت ۱۰۰ وارد کنید."
            />

            <div className="row g-3">
              {examCourses.map((course) => (
                <div className="col-12 col-sm-6 col-lg-4" key={course.name}>
                  <NumberField
                    label={course.name}
                    value={examPercents[course.name]}
                    min={-33.33}
                    max={100}
                    step="1"
                    suffix={`ضریب ${course.coefficient}`}
                    onChange={(value) => updateExamPercent(course.name, value)}
                  />
                </div>
              ))}
            </div>

            <div className="mt-4">
              <ScoreSummaryCard
                title="تراز تخمینی آزمون اختصاصی"
                value={formatRange(
                  prediction.examTrazRange.min,
                  prediction.examTrazRange.max,
                )}
                description="این مقدار با مدل کالیبره‌شده درصد به تراز محاسبه می‌شود."
                color="#2E7F81"
                background="rgba(46,127,129,0.06)"
                border="rgba(46,127,129,0.16)"
              />
            </div>

            <div className="d-flex gap-2 mt-4">
              <button
                type="button"
                onClick={handleCalculate}
                className="btn flex-grow-1 text-white fw-bold d-flex justify-content-center align-items-center gap-2"
                style={primaryButtonStyle}
              >
                <Sparkles size={16} />
                تخمین رتبه
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="btn btn-outline fw-bold d-flex align-items-center gap-2"
                style={secondaryButtonStyle}
              >
                <RotateCcw size={15} />
                بازنشانی
              </button>
            </div>
            {saveStatus ? (
              <p className="text-muted text-center mt-2 mb-0" style={{ fontSize: "11px" }}>
                {saveStatus}
              </p>
            ) : null}
          </SectionCard>

          {showResult && (
            <div id="prediction-result">
              <SectionCard>
                <SectionHeader
                  icon={<LineChart size={16} color="#2E7F81" />}
                  title="تخمین رتبه"
                  description="تخمین رتبه شما به شرح زیر است:"
                />

                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <ResultMetric
                      label="تراز تخمینی سوابق تحصیلی"
                      value={formatRange(
                        prediction.finalRecordTrazRange.min,
                        prediction.finalRecordTrazRange.max,
                      )}
                      color="#0f766e"
                      background="#f0fdfa"
                      border="#ccfbf1"
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <ResultMetric
                      label="تراز تخمینی آزمون اختصاصی، کنکور"
                      value={formatRange(
                        prediction.examTrazRange.min,
                        prediction.examTrazRange.max,
                      )}
                      color="#2E7F81"
                      background="rgba(46,127,129,0.07)"
                      border="rgba(46,127,129,0.16)"
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <ResultMetric
                      label="تراز کل"
                      value={formatRange(
                        prediction.totalTrazRange.min,
                        prediction.totalTrazRange.max,
                      )}
                      color="#1E2B4D"
                      background="#F7F6F1"
                      border="#E3E1D8"
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <ResultMetric
                      label="رتبه تخمینی شما در کشور"
                      value={formatRange(
                        prediction.countryRankRange.min,
                        prediction.countryRankRange.max,
                      )}
                      color="#A9741B"
                      background="#F7ECD8"
                      border="#EFE0B8"
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <ResultMetric
                      label={`رتبه تخمینی شما در ${area}`}
                      value={formatRange(
                        prediction.quotaRankRange.min,
                        prediction.quotaRankRange.max,
                      )}
                      color="#D64545"
                      background="#F9E3E3"
                      border="#F0C9C9"
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <ResultMetric
                      label="معدل کتبی نهایی"
                      value={`${formatDecimal(prediction.finalAverage)} از ۲۰`}
                      color="#247147"
                      background="#DFF0E6"
                      border="#d1fae5"
                    />
                  </div>
                </div>

                <div className="mt-3" style={statusCardStyle}>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <TrendingUp size={16} color="#2E7F81" />

                    <h3 className="mb-0 fw-bold" style={sectionTitleStyle}>
                      تحلیل وضعیت
                    </h3>
                  </div>

                  <p className="mb-0 text-secondary" style={paragraphStyle}>
                    {getPredictionMessage(prediction.totalTraz)}
                  </p>
                </div>
              </SectionCard>
              <div className="d-flex gap-2 mt-4">
                <SectionCard>
                  <SectionHeader
                    icon={<Building2 size={16} color="#2E7F81" />}
                    title="رشته و دانشگاه‌های احتمالی"
                    description="می‌توانید از فهرست زیر یک رشته و دانشگاه مشخص را انتخاب کنید یا پیشنهادهای نزدیک به رتبه خود را بررسی نمایید."
                  />

                  {/* خلاصه رتبه و تراز داوطلب */}
                  <div className="row g-3 mb-4">
                    <div className="col-12 col-md-4">
                      <div
                        style={{
                          background: "#F7F6F1",
                          border: "1px solid #E3E1D8",
                          borderRadius: "15px",
                          padding: "13px",
                          fontSize: "12px",
                          lineHeight: "2",
                        }}
                      >
                        منطقه انتخابی:
                        <strong className="d-block">{area}</strong>
                      </div>
                    </div>

                    <div className="col-12 col-md-4">
                      <div
                        style={{
                          background: "#F7F6F1",
                          border: "1px solid #E3E1D8",
                          borderRadius: "15px",
                          padding: "13px",
                          fontSize: "12px",
                          lineHeight: "2",
                        }}
                      >
                        رتبه در سهمیه:
                        <strong className="d-block">
                          {formatNumber(prediction.estimatedQuotaRank)}
                        </strong>
                      </div>
                    </div>

                    <div className="col-12 col-md-4">
                      <div
                        style={{
                          background: "#F7F6F1",
                          border: "1px solid #E3E1D8",
                          borderRadius: "15px",
                          padding: "13px",
                          fontSize: "12px",
                          lineHeight: "2",
                        }}
                      >
                        تراز کل:
                        <strong className="d-block">
                          {formatNumber(prediction.totalTraz)}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* انتخاب رشته و دانشگاه مشخص */}
                  <div
                    style={{
                      background: "#EAF2F1",
                      border: "1px solid #DCEBEA",
                      borderRadius: "18px",
                      padding: "16px",
                      marginBottom: "24px",
                    }}
                  >
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <Target size={17} color="#2E7F81" />

                      <h3
                        className="fw-bold mb-0"
                        style={{
                          color: "#312e81",
                          fontSize: "14px",
                        }}
                      >
                        بررسی رشته و دانشگاه دلخواه
                      </h3>
                    </div>

                    <div className="row g-3">
                      <div className="col-12 col-lg-8">
                        <label className="w-100">
                          <span
                            className="d-block mb-2 fw-bold"
                            style={{
                              color: "#4A5553",
                              fontSize: "11px",
                            }}
                          >
                            انتخاب رشته و دانشگاه
                          </span>

                          <select
                            value={selectedAdmissionId}
                            onChange={(event) =>
                              setSelectedAdmissionId(event.target.value)
                            }
                            className="form-select text-end"
                            style={inputStyle}
                          >
                            <option value="">
                              رشته و دانشگاه را انتخاب کنید
                            </option>

                            {admissionSelectOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>

                      <div className="col-12 col-lg-4">
                        <div
                          style={{
                            background: "#ffffff",
                            border: "1px solid #E3E1D8",
                            borderRadius: "14px",
                            padding: "12px",
                            color: "#7C8683",
                            fontSize: "11px",
                            lineHeight: "2",
                          }}
                        >
                          گروه آزمایشی:
                          <strong className="d-block text-dark">{major}</strong>
                          اطلاعات رتبه و تراز این بخش بر اساس منطقه انتخابی
                          محاسبه می‌شود.
                        </div>
                      </div>
                    </div>

                    {/* نتیجه دانشگاه انتخاب‌شده */}
                    {selectedAdmissionId && (
                      <div className="mt-4">
                        <SelectedAdmissionResultCard
                          result={selectedAdmissionResult}
                          area={area}
                          userRank={prediction.estimatedQuotaRank}
                          userTraz={prediction.totalTraz}
                        />
                      </div>
                    )}
                  </div>

                  {/* پیشنهادهای خودکار */}
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <LineChart size={17} color="#2E7F81" />

                    <h3
                      className="fw-bold mb-0"
                      style={{
                        color: "#14201E",
                        fontSize: "14px",
                      }}
                    >
                      پیشنهادهای نزدیک به رتبه شما
                    </h3>
                  </div>

                  {prediction.admissionOptions?.length > 0 ? (
                    <div className="row g-3">
                      {prediction.admissionOptions.map((item) => (
                        <div className="col-12 col-md-6" key={item.id}>
                          <AdmissionCard item={item} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState message="برای این ترکیب رشته و منطقه، داده کافی در پایگاه فعلی وجود ندارد." />
                  )}

                  <div
                    className="mt-4"
                    style={{
                      color: "#7C8683",
                      fontSize: "11px",
                      lineHeight: "2",
                    }}
                  >
                    توجه: رتبه‌های قبولی تقریبی هستند و به ظرفیت سال، نوع دوره،
                    بومی‌گزینی، نیمسال پذیرش و تغییرات دفترچه انتخاب رشته بستگی
                    دارند.
                  </div>
                </SectionCard>
              </div>
              <div className="d-flex gap-2 mt-4">
                <SectionCard style={{ marginTop: "100px" }}>
                  <SectionHeader
                    icon={<GraduationCap size={16} color="#2E7F81" />}
                    title="احتمال دعوت به ارزیابی فرهنگیان"
                    description="این بخش فقط تخمین دعوت به ارزیابی است و قبولی نهایی را تضمین نمی‌کند."
                  />

                  <div
                    style={{
                      background: prediction.farhangianChance.background,
                      border: `1px solid ${prediction.farhangianChance.border}`,
                      color: prediction.farhangianChance.color,
                      borderRadius: "16px",
                      padding: "16px",
                      fontSize: "13px",
                      lineHeight: "2",
                    }}
                  >
                    <strong>{prediction.farhangianChance.label}</strong>

                    <p className="mb-0 mt-2">
                      رتبه مورد استفاده:{" "}
                      <strong>
                        {formatNumber(prediction.estimatedQuotaRank)}
                      </strong>{" "}
                      در {area}
                    </p>

                    <p className="mb-0 mt-2" style={{ fontSize: "11px" }}>
                      نتیجه نهایی فرهنگیان به مصاحبه، گزینش، ظرفیت، بومی‌گزینی،
                      جنسیت و شرایط اختصاصی دفترچه همان سال وابسته است.
                    </p>
                  </div>
                </SectionCard>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

/*
|--------------------------------------------------------------------------
| کامپوننت‌های رابط کاربری
|--------------------------------------------------------------------------
*/

function SectionCard({ children }) {
  return (
    <section className="card border-0 shadow-sm" style={cardStyle}>
      <div className="card-body p-4 text-end">{children}</div>
    </section>
  );
}

function SectionHeader({ icon, title, description }) {
  return (
    <div className="mb-4">
      <h2
        className="fw-bold d-flex align-items-center gap-2 mb-1"
        style={sectionTitleStyle}
      >
        {icon}
        {title}
      </h2>

      <p className="text-muted mb-0" style={helperTextStyle}>
        {description}
      </p>
    </div>
  );
}

function SelectField({ label, value, options, onChange }) {
  return (
    <label className="w-100">
      <span
        className="d-block mb-2 fw-bold text-muted"
        style={{ fontSize: "11px" }}
      >
        {label}
      </span>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="form-select text-end"
        style={inputStyle}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function NumberField({ label, value, min, max, step, suffix, onChange }) {
  return (
    <label className="w-100" style={fieldBoxStyle}>
      <span className="d-flex justify-content-between align-items-center gap-2 mb-2">
        <span className="fw-bold text-muted" style={{ fontSize: "11px" }}>
          {label}
        </span>

        <span className="text-muted text-nowrap" style={{ fontSize: "10px" }}>
          {suffix}
        </span>
      </span>

      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="form-control text-center"
        style={numberInputStyle}
      />
    </label>
  );
}

function ScoreSummaryCard({
  title,
  value,
  description,
  color,
  background,
  border,
}) {
  return (
    <div
      style={{
        background,
        border: `1px solid ${border}`,
        borderRadius: "16px",
        padding: "15px",
      }}
    >
      <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap">
        <div>
          <span className="d-block fw-bold" style={{ fontSize: "12px", color }}>
            {title}
          </span>

          <p
            className="mb-0 mt-1"
            style={{ fontSize: "12px", lineHeight: "1.9", color }}
          >
            {description}
          </p>
        </div>

        <strong className="text-nowrap" style={{ fontSize: "22px", color }}>
          {value}
        </strong>
      </div>
    </div>
  );
}

function ResultMetric({ label, value, color, background, border }) {
  return (
    <div
      className="h-100"
      style={{
        background,
        border: `1px solid ${border}`,
        borderRadius: "16px",
        padding: "15px",
      }}
    >
      <span
        className="d-block fw-bold mb-2"
        style={{ fontSize: "11px", color }}
      >
        {label}
      </span>

      <strong
        className="d-block"
        style={{ fontSize: "21px", color, lineHeight: "1.7" }}
      >
        {value}
      </strong>
    </div>
  );
}

function AdmissionCard({ item }) {
  const { status } = item;

  return (
    <div
      className="h-100"
      style={{
        border: `1px solid ${status.border}`,
        background: status.background,
        borderRadius: "18px",
        padding: "16px",
      }}
    >
      <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
        <div>
          <h3
            className="fw-bold mb-1"
            style={{
              fontSize: "15px",
              color: "#14201E",
            }}
          >
            {item.field}
          </h3>

          <div
            className="fw-bold"
            style={{
              color: "#2E7F81",
              fontSize: "13px",
            }}
          >
            {item.university}
          </div>
        </div>

        <span
          className="text-nowrap"
          style={{
            color: status.color,
            background: "#ffffff",
            border: `1px solid ${status.border}`,
            borderRadius: "999px",
            padding: "6px 9px",
            fontSize: "10px",
            fontWeight: 800,
          }}
        >
          {status.label}
        </span>
      </div>

      <div className="d-flex flex-wrap gap-2 mb-3">
        <InfoPill label="نوع دوره" value={item.courseType} />
        <InfoPill label="مقطع" value={item.degree} />
      </div>

      <div
        style={{
          borderTop: "1px solid rgba(148,163,184,0.2)",
          paddingTop: "12px",
        }}
      >
        <div className="d-flex justify-content-between gap-2 mb-2">
          <span className="text-muted" style={{ fontSize: "11px" }}>
            آخرین رتبه تقریبی منطقه
          </span>

          <strong style={{ fontSize: "12px", color: "#14201E" }}>
            {formatNumber(item.requiredRank)}
          </strong>
        </div>

        <div className="d-flex justify-content-between gap-2 mb-2">
          <span className="text-muted" style={{ fontSize: "11px" }}>
            تراز تقریبی موردنیاز
          </span>

          <strong style={{ fontSize: "12px", color: "#14201E" }}>
            {formatNumber(item.requiredTraz)}
          </strong>
        </div>

        <div className="d-flex justify-content-between gap-2">
          <span className="text-muted" style={{ fontSize: "11px" }}>
            کیفیت داده
          </span>

          <strong
            style={{
              fontSize: "11px",
              color: item.reliability === "متوسط" ? "#A9741B" : "#7C8683",
            }}
          >
            {item.reliability}
          </strong>
        </div>
      </div>

      <div
        className="mt-3 text-muted"
        style={{
          fontSize: "10px",
          lineHeight: "1.8",
        }}
      >
        منبع داده: {item.sourceYear}
      </div>
    </div>
  );
}
function SelectedAdmissionResultCard({ result, area, userRank, userTraz }) {
  if (!result) {
    return (
      <div
        style={{
          border: "1px dashed #C9C7BC",
          background: "#F7F6F1",
          borderRadius: "16px",
          padding: "16px",
          fontSize: "12px",
          lineHeight: "2",
          color: "#7C8683",
        }}
      >
        یک رشته و دانشگاه را انتخاب کنید تا احتمال قبولی شما محاسبه شود.
      </div>
    );
  }

  const { status } = result;

  const rankText =
    result.rankDifference <= 0
      ? `${formatNumber(Math.abs(result.rankDifference))} رتبه بهتر از کف قبولی`
      : `${formatNumber(result.rankDifference)} رتبه ضعیف‌تر از کف قبولی`;

  const trazText =
    result.trazDifference >= 0
      ? `${formatNumber(result.trazDifference)} واحد بالاتر از تراز موردنیاز`
      : `${formatNumber(Math.abs(result.trazDifference))} واحد پایین‌تر از تراز موردنیاز`;

  return (
    <div
      style={{
        border: `1px solid ${status.border}`,
        background: status.background,
        borderRadius: "18px",
        padding: "16px",
      }}
    >
      <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap mb-3">
        <div>
          <h3
            className="fw-bold mb-1"
            style={{
              fontSize: "16px",
              color: "#14201E",
            }}
          >
            {result.field}
          </h3>

          <div
            className="fw-bold"
            style={{
              color: "#2E7F81",
              fontSize: "13px",
            }}
          >
            {result.university}
          </div>

          <div className="d-flex flex-wrap gap-2 mt-2">
            <InfoPill label="نوع دوره" value={result.courseType} />
            <InfoPill label="مقطع" value={result.degree} />
          </div>
        </div>

        <div className="text-start">
          <span
            className="d-inline-block mb-2"
            style={{
              color: status.color,
              background: "#ffffff",
              border: `1px solid ${status.border}`,
              borderRadius: "999px",
              padding: "6px 10px",
              fontSize: "11px",
              fontWeight: 800,
            }}
          >
            {status.label}
          </span>

          <div
            className="fw-bold"
            style={{
              color: status.color,
              fontSize: "26px",
              lineHeight: "1.4",
            }}
          >
            {formatNumber(result.probability)}٪
          </div>

          <div
            style={{
              color: status.color,
              fontSize: "10px",
              fontWeight: 700,
            }}
          >
            احتمال تخمینی قبولی
          </div>
        </div>
      </div>

      <div
        style={{
          background: "#ffffff",
          border: "1px solid rgba(148,163,184,0.22)",
          borderRadius: "14px",
          padding: "12px",
        }}
      >
        <ComparisonRow
          label={`رتبه شما در ${area}`}
          value={formatNumber(userRank)}
        />

        <ComparisonRow
          label="آخرین رتبه تقریبی قبولی"
          value={formatNumber(result.requiredRank)}
        />

        <ComparisonRow
          label="فاصله رتبه‌ای"
          value={rankText}
          color={result.rankDifference <= 0 ? "#247147" : "#A9741B"}
        />

        <ComparisonRow label="تراز کل شما" value={formatNumber(userTraz)} />

        <ComparisonRow
          label="تراز تقریبی موردنیاز"
          value={formatNumber(result.requiredTraz)}
        />

        <ComparisonRow
          label="فاصله ترازی"
          value={trazText}
          color={result.trazDifference >= 0 ? "#247147" : "#A9741B"}
          isLast
        />
      </div>

      <div
        className="mt-3"
        style={{
          fontSize: "11px",
          lineHeight: "1.9",
          color: "#7C8683",
        }}
      >
        کیفیت داده: <strong>{result.reliability}</strong>
        <br />
        منبع داده: {result.sourceYear}
      </div>
    </div>
  );
}

function ComparisonRow({ label, value, color = "#14201E", isLast = false }) {
  return (
    <div
      className="d-flex justify-content-between gap-3"
      style={{
        paddingBottom: isLast ? 0 : "9px",
        marginBottom: isLast ? 0 : "9px",
        borderBottom: isLast ? "none" : "1px solid #EFEEE7",
      }}
    >
      <span
        className="text-muted"
        style={{
          fontSize: "11px",
        }}
      >
        {label}
      </span>

      <strong
        className="text-start"
        style={{
          fontSize: "12px",
          color,
        }}
      >
        {value}
      </strong>
    </div>
  );
}

function InfoPill({ label, value }) {
  return (
    <span
      style={{
        background: "#ffffff",
        border: "1px solid #E3E1D8",
        borderRadius: "999px",
        padding: "6px 9px",
        fontSize: "10px",
        color: "#4b5563",
      }}
    >
      {label}: {value}
    </span>
  );
}

function AlertBox({ message }) {
  return (
    <div
      className="d-flex align-items-start gap-2"
      style={{
        border: "1px solid #EFE0B8",
        background: "#F7ECD8",
        color: "#A9741B",
        borderRadius: "16px",
        padding: "12px",
        fontSize: "12px",
        lineHeight: "1.9",
      }}
    >
      <AlertCircle size={16} style={{ marginTop: 3 }} />
      <span>{message}</span>
    </div>
  );
}

function StatBadge({ label, value, color }) {
  return (
    <div style={statBadgeStyle}>
      <span className="d-block" style={{ fontSize: "10px", color: "#7C8683" }}>
        {label}
      </span>

      <strong style={{ fontSize: "16px", color }}>{value}</strong>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div
      className="text-center text-muted"
      style={{
        border: "1px solid #EFEEE7",
        background: "#F7F6F1",
        borderRadius: "16px",
        padding: "20px",
        fontSize: "12px",
        lineHeight: "1.9",
      }}
    >
      {message}
    </div>
  );
}

function getPredictionMessage(totalTraz) {
  if (totalTraz >= 10500) {
    return "تراز تخمینی بسیار خوب است و می‌تواند برای رشته‌ها و دانشگاه‌های رقابتی شانس ایجاد کند.";
  }

  if (totalTraz >= 9500) {
    return "تراز تخمینی خوب است. تقویت درس‌های ضریب‌بالا می‌تواند شانس قبولی در گزینه‌های بهتر را افزایش دهد.";
  }

  if (totalTraz >= 8500) {
    return "تراز تخمینی متوسط رو به خوب است. بهتر است تمرکز اصلی روی درس‌های با ضریب بالاتر باشد.";
  }

  return "تراز تخمینی نیاز به تقویت دارد. افزایش معدل دروس ضریب‌بالا و درصدهای آزمون بیشترین اثر را خواهد داشت.";
}

/*
|--------------------------------------------------------------------------
| استایل‌ها
|--------------------------------------------------------------------------
*/

const pageStyle = {
  maxWidth: "1200px",
  direction: "rtl",
  fontFamily: "Vazir, Tahoma, Arial, sans-serif",
};

const cardStyle = {
  borderRadius: "24px",
  overflow: "hidden",
  background: "#ffffff",
};

const titleStyle = {
  fontSize: "19px",
  lineHeight: "1.8",
};

const sectionTitleStyle = {
  fontSize: "15px",
  lineHeight: "1.8",
};

const paragraphStyle = {
  fontSize: "13px",
  lineHeight: "2",
};

const helperTextStyle = {
  fontSize: "11px",
  lineHeight: "1.9",
};

const iconBadgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  background: "rgba(46,127,129,0.1)",
  color: "#2E7F81",
  borderRadius: "15px",
  padding: "14px",
};

const inputStyle = {
  minHeight: "44px",
  borderRadius: "13px",
  border: "1px solid #E3E1D8",
  background: "#F7F6F1",
  fontSize: "13px",
  fontWeight: 700,
};

const fieldBoxStyle = {
  display: "block",
  border: "1px solid #edf0f5",
  background: "#F7F6F1",
  borderRadius: "15px",
  padding: "12px",
};

const numberInputStyle = {
  minHeight: "40px",
  borderRadius: "11px",
  border: "1px solid #E3E1D8",
  fontSize: "13px",
  fontWeight: 700,
};

const primaryButtonStyle = {
  minHeight: "46px",
  borderRadius: "13px",
  background: "#2E7F81",
  border: "none",
  padding: "12px 16px",
  fontSize: "13px",
  boxShadow: "0 8px 20px rgba(46,127,129,0.24)",
};

const secondaryButtonStyle = {
  minHeight: "46px",
  borderRadius: "13px",
  padding: "10px 15px",
  fontSize: "12px",
};

const statusCardStyle = {
  border: "1px solid rgba(46,127,129,0.13)",
  background: "rgba(46,127,129,0.05)",
  borderRadius: "16px",
  padding: "15px",
};

const statBadgeStyle = {
  minWidth: "130px",
  border: "1px solid #edf0f5",
  background: "#F7F6F1",
  borderRadius: "13px",
  padding: "9px 12px",
};

const toggleBoxStyle = {
  border: "1px solid #edf0f5",
  background: "#F7F6F1",
  borderRadius: "15px",
  padding: "12px",
};

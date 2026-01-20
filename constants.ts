import { Template } from './types';

export const COLOR_THEMES = {
  berry: {
    id: 'berry',
    name: '缤纷浆果',
    colors: ['#845EC2', '#D65DB1', '#FF6F91', '#FF9671', '#FFC75F', '#008F7A', '#4E8397', '#C34A36'],
  },
  sunset: {
    id: 'sunset',
    name: '日落余晖',
    colors: ['#F94144', '#F3722C', '#F8961E', '#F9844A', '#F9C74F', '#90BE6D', '#43AA8B', '#577590'],
  },
  ocean: {
    id: 'ocean',
    name: '深蓝海洋',
    colors: ['#0077B6', '#0096C7', '#00B4D8', '#48CAE4', '#90E0EF', '#ADE8F4', '#023E8A', '#03045E'],
  },
  forest: {
    id: 'forest',
    name: '清新森林',
    colors: ['#264653', '#2A9D8F', '#E9C46A', '#F4A261', '#E76F51', '#2D6A4F', '#40916C', '#52B788'],
  },
};

export const DEFAULT_CATEGORIES = [
  { id: 'daily', name: '日常琐事' },
  { id: 'entertainment', name: '休闲娱乐' },
  { id: 'work', name: '工作学习' },
];

export const DEFAULT_TEMPLATES: Template[] = [
  {
    id: 'default-food',
    title: '今天吃什么',
    options: ['火锅', '烧烤', '日料', '麻辣烫', '炸鸡汉堡', '披萨', '轻食沙拉', '家常菜'],
    isDefault: true,
    colorTheme: 'berry',
    categoryId: 'daily',
  },
  {
    id: 'default-activity',
    title: '现在做什么',
    options: ['看电影', '打游戏', '去散步', '看书', '大扫除', '睡午觉', '去健身', '学新技能'],
    isDefault: true,
    colorTheme: 'ocean',
    categoryId: 'entertainment',
  },
];
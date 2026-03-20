import { Waypoint, SkillNode, LevelConfig } from './types';

export const WAYPOINTS: Waypoint[] = [
  { x: 0, y: 0, type: 'start' },
  { x: 0, y: -1200, type: 'normal' },
  { x: 600, y: -1200, type: 'elite1' },
  { x: 600, y: -2400, type: 'normal' },
  { x: -600, y: -2400, type: 'elite2' },
  { x: -600, y: -3600, type: 'elite3' },
  { x: 0, y: -3600, type: 'normal' },
  { x: 0, y: -4800, type: 'boss' },
];

export const UNLOCK_THRESHOLDS = [3, 5, 8, 10, 12, 15, 18, 20];

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: '平原古道',
    difficulty: 1,
    rewardTickets: 50,
    monsterHpMult: 1,
    monsterSpeedMult: 1,
    spawnIntervalMult: 1,
    waypoints: [
      { x: 0, y: 0, type: 'start' },
      { x: 0, y: -1200, type: 'normal' },
      { x: 600, y: -1200, type: 'elite1' },
      { x: 600, y: -2400, type: 'normal' },
      { x: -600, y: -2400, type: 'elite2' },
      { x: -600, y: -3600, type: 'normal' },
      { x: 0, y: -3600, type: 'normal' },
      { x: 0, y: -4800, type: 'boss' },
    ]
  },
  {
    id: 2,
    name: '幽暗森林',
    difficulty: 2,
    rewardTickets: 100,
    monsterHpMult: 1.5,
    monsterSpeedMult: 1.1,
    spawnIntervalMult: 0.9,
    waypoints: [
      { x: 0, y: 0, type: 'start' },
      { x: 300, y: -600, type: 'normal' },
      { x: -300, y: -1200, type: 'elite1' },
      { x: 300, y: -1800, type: 'normal' },
      { x: -300, y: -2400, type: 'elite2' },
      { x: 0, y: -3000, type: 'boss' },
    ]
  },
  {
    id: 3,
    name: '熔岩炼狱',
    difficulty: 3,
    rewardTickets: 200,
    monsterHpMult: 2.5,
    monsterSpeedMult: 1.2,
    spawnIntervalMult: 0.7,
    waypoints: [
      { x: 0, y: 0, type: 'start' },
      { x: 0, y: -800, type: 'normal' },
      { x: 400, y: -800, type: 'elite1' },
      { x: 400, y: -1600, type: 'elite2' },
      { x: 0, y: -1600, type: 'normal' },
      { x: -400, y: -1600, type: 'elite3' },
      { x: -400, y: -2400, type: 'boss' },
    ]
  }
];

export const SKILL_TREES: Record<string, SkillNode[]> = {
  flame: [
    { id: 'flame_A', heroType: 'flame', tier: 'basic', name: '火球伤害', desc: '火球伤害+50%', reqs: [] },
    { id: 'flame_B', heroType: 'flame', tier: 'basic', name: '点燃', desc: '火球会点燃敌人', reqs: [] },
    { id: 'flame_C', heroType: 'flame', tier: 'basic', name: '火球攻速', desc: '火球攻击速度+30%', reqs: [] },
    { id: 'flame_D', heroType: 'flame', tier: 'advanced', name: '二次爆炸', desc: '爆炸两次', reqs: ['flame_A'] },
    { id: 'flame_E', heroType: 'flame', tier: 'advanced', name: '火堆', desc: '被点燃的敌人死亡后留下火堆', reqs: ['flame_B'] },
    { id: 'flame_F', heroType: 'flame', tier: 'advanced', name: '穿透', desc: '火球穿透1个敌人', reqs: ['flame_C'] },
    { id: 'flame_G', heroType: 'flame', tier: 'ultimate', name: '喷火器', desc: '扇形持续火焰', reqs: ['flame_D', 'flame_E'] },
  ],
  ice: [
    { id: 'ice_A', heroType: 'ice', tier: 'basic', name: '深度冻结', desc: '更强的减速，有几率冻结', reqs: [] },
    { id: 'ice_B', heroType: 'ice', tier: 'basic', name: '三连射', desc: '发射3支冰箭', reqs: [] },
    { id: 'ice_C', heroType: 'ice', tier: 'basic', name: '碎冰', desc: '对冻结敌人伤害+100%', reqs: [] },
    { id: 'ice_D', heroType: 'ice', tier: 'advanced', name: '冰霜光环', desc: '冻结的敌人会减速周围敌人', reqs: ['ice_A'] },
    { id: 'ice_E', heroType: 'ice', tier: 'advanced', name: '冰雹', desc: '随机冰雹攻击', reqs: ['ice_B'] },
    { id: 'ice_F', heroType: 'ice', tier: 'advanced', name: '穿透', desc: '冰箭穿透敌人', reqs: ['ice_C'] },
    { id: 'ice_G', heroType: 'ice', tier: 'ultimate', name: '冰霜风暴', desc: '持续范围减速和伤害', reqs: ['ice_E', 'ice_F'] },
  ],
  lightning: [
    { id: 'lightning_A', heroType: 'lightning', tier: 'basic', name: '更多弹跳', desc: '闪电链弹跳+3', reqs: [] },
    { id: 'lightning_B', heroType: 'lightning', tier: 'basic', name: '超载', desc: '有几率造成二次伤害', reqs: [] },
    { id: 'lightning_C', heroType: 'lightning', tier: 'basic', name: '暴击率', desc: '暴击率+50%', reqs: [] },
    { id: 'lightning_D', heroType: 'lightning', tier: 'advanced', name: '雷云', desc: '弹跳时留下雷云', reqs: ['lightning_A'] },
    { id: 'lightning_E', heroType: 'lightning', tier: 'advanced', name: '麻痹', desc: '超载会麻痹敌人', reqs: ['lightning_B'] },
    { id: 'lightning_F', heroType: 'lightning', tier: 'advanced', name: '暴击弹跳', desc: '暴击增加额外弹跳', reqs: ['lightning_C'] },
    { id: 'lightning_G', heroType: 'lightning', tier: 'ultimate', name: '持续打击', desc: '自动打击范围内所有敌人', reqs: ['lightning_D', 'lightning_F'] },
  ],
  wind: [
    { id: 'wind_A', heroType: 'wind', tier: 'basic', name: '穿透', desc: '风刃穿透1个敌人', reqs: [] },
    { id: 'wind_B', heroType: 'wind', tier: 'basic', name: '致残', desc: '降低敌人攻击/移动速度', reqs: [] },
    { id: 'wind_C', heroType: 'wind', tier: 'basic', name: '顺风', desc: '命中增加自身攻速', reqs: [] },
    { id: 'wind_D', heroType: 'wind', tier: 'advanced', name: '真空', desc: '风刃吸引敌人', reqs: ['wind_A'] },
    { id: 'wind_E', heroType: 'wind', tier: 'advanced', name: '破甲', desc: '致残同时降低护甲/抗性', reqs: ['wind_B'] },
    { id: 'wind_F', heroType: 'wind', tier: 'advanced', name: '极限顺风', desc: '攻速增益上限提升', reqs: ['wind_C'] },
    { id: 'wind_G', heroType: 'wind', tier: 'ultimate', name: '风场', desc: '偏转投射物，减速近战', reqs: ['wind_D', 'wind_E'] },
  ],
  rock: [
    { id: 'rock_A', heroType: 'rock', tier: 'basic', name: '巨石', desc: '击晕第一个命中的敌人', reqs: [] },
    { id: 'rock_B', heroType: 'rock', tier: 'basic', name: '碎裂', desc: '命中造成溅射伤害', reqs: [] },
    { id: 'rock_C', heroType: 'rock', tier: 'basic', name: '岩石护盾', desc: '命中获得物理护盾', reqs: [] },
    { id: 'rock_D', heroType: 'rock', tier: 'advanced', name: '地震', desc: '巨石引发地震', reqs: ['rock_A'] },
    { id: 'rock_E', heroType: 'rock', tier: 'advanced', name: '尖刺护盾', desc: '护盾反弹近战伤害', reqs: ['rock_B'] },
    { id: 'rock_F', heroType: 'rock', tier: 'advanced', name: '厚重护盾', desc: '护盾叠加层数上限提升', reqs: ['rock_C'] },
    { id: 'rock_G', heroType: 'rock', tier: 'ultimate', name: '岩石地刺', desc: '投掷一排地刺，获得大量减伤', reqs: ['rock_D', 'rock_E'] },
  ],
  shadow: [
    { id: 'shadow_A', heroType: 'shadow', tier: 'basic', name: '诅咒残留', desc: '诅咒持续时间x2', reqs: [] },
    { id: 'shadow_B', heroType: 'shadow', tier: 'basic', name: '处决', desc: '秒杀生命值<20%的敌人', reqs: [] },
    { id: 'shadow_C', heroType: 'shadow', tier: 'basic', name: '吸血', desc: '造成伤害时恢复生命', reqs: [] },
    { id: 'shadow_D', heroType: 'shadow', tier: 'advanced', name: '传染', desc: '诅咒传染给附近敌人', reqs: ['shadow_A'] },
    { id: 'shadow_E', heroType: 'shadow', tier: 'advanced', name: '暗影分身', desc: '处决召唤暗影助手', reqs: ['shadow_B'] },
    { id: 'shadow_F', heroType: 'shadow', tier: 'advanced', name: '强效吸血', desc: '治疗量提升', reqs: ['shadow_C'] },
    { id: 'shadow_G', heroType: 'shadow', tier: 'ultimate', name: '死亡低语', desc: '永久叠加伤害加深', reqs: ['shadow_D', 'shadow_E'] },
  ],
};
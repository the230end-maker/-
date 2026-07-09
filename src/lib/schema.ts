export type AgentId='architect'|'character'|'world'|'writer'|'checker'|'editor';
export const collections=['novel','chapters','characters','world','glossary','timeline','relationships','novel_state','agent_conversations','settings','backups'] as const;
export const novelSchema={novel:{id:'uuid',title:'اسم الرواية',genre:'النوع الأدبي',initialIdea:'الفكرة الأولية',createdAt:'timestamp',lastModified:'timestamp'},settings:{agentModelAssignments:{architect:'default',character:'default',world:'default',writer:'expert',checker:'default',editor:'expert'},powProvider:'railway'}};

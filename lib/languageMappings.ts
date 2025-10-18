export const mapLanguageToMonaco = (language: string): string => {
    const mapping: { [key: string]: string } = {
        'JavaScript': 'javascript',
        'TypeScript': 'typescript',
        'Python': 'python',
        'C++': 'cpp',
    };
    return mapping[language] || 'plaintext';
};
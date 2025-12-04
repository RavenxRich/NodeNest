// File-based storage fallback for browsers that don't support File System Access API

export const saveToFile = (data, filename = 'nodenest_tools.json') => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const loadFromFile = () => {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) {
        reject(new Error('No file selected'));
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          resolve(data);
        } catch (error) {
          reject(new Error('Invalid JSON file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    };
    
    input.click();
  });
};

export const checkFileSystemSupport = () => {
  return 'showDirectoryPicker' in window;
};

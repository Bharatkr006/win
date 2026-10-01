const fs = require('fs');
let code = fs.readFileSync('src/components/DayCard.jsx', 'utf8');

code = code.replace(/<input\n\s*type="text"/, `<input
                    onFocus={(e) => {
                      setTimeout(() => {
                        e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }, 300);
                    }}
                    type="text"`);

fs.writeFileSync('src/components/DayCard.jsx', code);

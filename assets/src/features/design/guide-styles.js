// Embedded so downloaded guides work offline.
export const guideStyles = `
body {
  font:
    18px/1.6 system-ui,
    sans-serif;
  color: #12264d;
  background: #eef3f7;
  margin: 0;
  padding: 24px;
}
main {
  max-width: 800px;
  margin: auto;
  background: white;
  padding: 32px;
  border-top: 6px solid #a16b0c;
  border-radius: 12px;
}
h1 {
  margin-top: 0;
}
h2 {
  font-size: 24px;
  border-bottom: 2px solid #a16b0c;
  padding-bottom: 8px;
}
p {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
header p {
  color: #31546e;
}
@media (max-width: 600px) {
  body {
    padding: 12px;
  }
  main {
    padding: 20px;
  }
}
@media print {
  body {
    background: white;
    padding: 0;
  }
  main {
    padding: 0;
    border: 0;
  }
  h2 {
    break-after: avoid;
  }
}
.flow {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  list-style-position: inside;
  padding: 0;
}
.flow li {
  background: #e8f3fa;
  border-top: 4px solid #09648b;
  padding: 14px;
  border-radius: 8px;
}
.flow p {
  margin: 6px 0 0;
}
.plans {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.plans article {
  border: 1px solid #a16b0c;
  border-radius: 10px;
  padding: 16px;
}
.plans .flow {
  grid-template-columns: 1fr;
}
blockquote {
  margin: 16px 0;
  border-left: 4px solid #a16b0c;
  padding: 16px;
  background: #fff3ce;
}
h3 {
  font-size: 20px;
}
section {
  margin-top: 32px;
}
@media (max-width: 600px) {
  .flow,
  .plans {
    grid-template-columns: 1fr;
  }
}
@media print {
  .flow li,
  .plans article {
    break-inside: avoid;
  }
}
.guide-brand {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #12264d;
  color: white;
  padding: 20px;
  border-bottom: 4px solid #d59e23;
  border-radius: 10px;
}
.guide-brand img {
  width: 64px;
  height: 64px;
}
.wordmark {
  font-size: 30px;
  font-weight: 800;
  line-height: 1.2;
}
.wordmark span {
  color: #76c9ed;
}
.guide-brand small {
  display: block;
  font-size: 16px;
  margin-top: 6px;
}
.toc {
  background: #edf5fa;
  border: 1px solid #8da7ba;
  border-radius: 10px;
  padding: 20px;
  margin: 24px 0;
}
.toc h2 {
  margin-top: 0;
  border: 0;
}
.toc a {
  color: #095b80;
  text-decoration: underline;
  font-weight: 600;
}
.toc li {
  margin: 8px 0;
}
.assignment {
  border-radius: 12px;
  overflow: hidden;
}

.assignment-banner span {
  font-size: 16px;

  font-weight: 700;
}
.assignment-banner h2 {
  border: 0;
  margin: 8px 0 0;
}

.assignment-content > p {
  background: white;

  border-left: 4px solid #09648b;
}

.rationale h3 {
  margin-top: 0;
}
.guide-section {
  scroll-margin-top: 16px;
}
@media print {
  .guide-brand,
  .assignment-banner {
    background: white;
    color: #12264d;
  }
  .assignment-banner span {
    color: #12264d;
  }
  .assignment-banner h2 {
    color: #12264d;
  }
  .assignment {
    break-before: page;
  }
  .toc a {
    color: #12264d;
  }
}
.toc-topic {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  border-bottom: 1px solid #8da7ba;
  padding-bottom: 12px;
}
.example-situation {
  display: grid;
  grid-template-columns: 160px 1fr;

  background: #fff8e6;

  border-radius: 12px;
}
.lemonade-visual {
  display: block;
  width: 100%;
  height: 90px;
  margin: 0 auto 10px;
}

.plans article {
  background: #f4f8fb;
  border-color: #8da7ba;
}
.plans .flow li {
  display: grid;

  gap: 0 12px;
  align-items: center;
  background: white;
  border: 1px solid #b6cbd9;
  padding: 12px;
}
.plans .flow .lemonade-visual {
  grid-row: span 2;

  margin: 0;
}
.plans .flow p {
  font-size: 16px;
}
.assignment {
  background: white;
  border: 1px solid #8da7ba;
  border-left: 6px solid #09648b;
  box-shadow: 0 5px 18px #12264d12;
}
.assignment-banner {
  background: #e8f3fa;
  color: #12264d;
  padding: 24px 28px;
  border-bottom: 1px solid #8da7ba;
}
.assignment-banner span {
  color: #095b80;
}
.assignment-banner h2 {
  color: #12264d;
  font-size: 28px;
}
.assignment-content {
  padding: 24px 28px;
}
.assignment-content > h3 {
  margin: 0 0 12px;
  color: #095b80;
}
.assignment-content > p {
  padding: 0;
  border: 0;
  margin: 0 0 28px;
  line-height: 1.8;
}
.rationale {
  background: #fff8e6;
  border: 0;
  border-top: 3px solid #a16b0c;
  border-radius: 0;
  padding: 20px;
}
.rationale p {
  margin-bottom: 0;
}
@media (max-width: 600px) {
  .example-situation {
    grid-template-columns: 1fr;
  }
  .example-situation .lemonade-visual {
    max-width: 170px;
  }
  .assignment-content,
  .assignment-banner {
    padding: 20px;
  }
}
.assignment-directions {
  margin-bottom: 28px;
}
.assignment-directions p {
  margin: 0 0 20px;
  line-height: 1.7;
}
.assignment-directions h4 {
  font-size: 20px;
  color: #095b80;
  margin: 24px 0 12px;
}
.assignment-steps {
  padding-left: 28px;
  margin: 12px 0 24px;
  list-style-position: outside;
}
.assignment-steps li {
  padding-left: 8px;
  margin: 0 0 14px;
  line-height: 1.65;
  overflow-wrap: anywhere;
}
.example-situation {
  align-items: center;
  padding: 24px;
  gap: 24px;
}
.example-situation h3 {
  margin: 0 0 12px;
}
.example-situation ul {
  margin: 0;
  padding-left: 24px;
}
.example-situation li {
  padding-left: 4px;
  margin: 0 0 8px;
}
.example-situation li:last-child {
  margin-bottom: 0;
}
.example-situation .lemonade-visual {
  margin: 0;
  height: auto;
  width: 100%;
  max-width: 170px;
}
@media (max-width: 600px) {
  .example-situation {
    gap: 16px;
    padding: 20px;
  }
  .example-situation > div:first-child {
    display: flex;
    justify-content: center;
  }
  .assignment-steps {
    padding-left: 24px;
  }
}
.plans .flow li {
  grid-template-columns: 110px 1fr;
}
.plans .flow .lemonade-visual {
  height: 80px;
}
@media (max-width: 600px) {
  .plans .flow li {
    grid-template-columns: 100px 1fr;
  }
}
@media (max-width: 420px) {
  body {
    padding: 8px;
    font-size: 16px;
  }
  main {
    padding: 16px;
  }
  h1 {
    font-size: 28px;
    line-height: 1.25;
  }
  .guide-brand {
    padding: 16px;
    gap: 10px;
  }
  .guide-brand img {
    width: 40px;
    height: 40px;
    flex-shrink: 0;
  }
  .guide-brand > div {
    min-width: 0;
  }
  .wordmark {
    font-size: 20px;
  }
  .toc,
  .example-situation,
  .assignment-content,
  .assignment-banner {
    padding: 16px;
  }
  .plans .flow li {
    grid-template-columns: 64px minmax(0, 1fr);
    gap: 8px;
  }
  .plans .flow .lemonade-visual {
    height: 60px;
  }
}
`;

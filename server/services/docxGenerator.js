import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType
} from 'docx';

const buildHeading = (text, level) =>
  new Paragraph({
    text,
    heading: level,
    spacing: { before: 240, after: 120 }
  });

const buildText = (text) =>
  new Paragraph({
    children: [new TextRun({ text, size: 22 })]
  });

const buildBullet = (text) =>
  new Paragraph({
    text,
    bullet: { level: 0 }
  });

const joinNonEmpty = (items) =>
  items.map((item) => (item || '').trim()).filter(Boolean).join(' | ');

export async function generateResumeDocxBuffer(resume, template = 'classic') {
  const basics = resume?.basics || { name: '' };

  const headerBlock = [
    buildHeading(basics.name || 'Resume', HeadingLevel.TITLE),
    basics.title ? buildText(basics.title) : buildText(''),
    buildText(
      joinNonEmpty([
        basics.email,
        basics.phone,
        basics.location,
        ...(basics.links || [])
      ])
    ),
    basics.summary ? buildHeading('Summary', HeadingLevel.HEADING_2) : buildText(''),
    basics.summary ? buildText(basics.summary) : buildText('')
  ];

  const classicBlocks = [
    resume?.skills?.length ? buildHeading('Skills', HeadingLevel.HEADING_2) : buildText(''),
    ...(resume?.skills || []).flatMap((group) => [
      buildText(group.name || 'Skills'),
      buildText((group.items || []).join(', '))
    ]),
    resume?.experience?.length ? buildHeading('Experience', HeadingLevel.HEADING_2) : buildText(''),
    ...(resume?.experience || []).flatMap((exp) => [
      buildText(joinNonEmpty([exp.role, exp.company, exp.dates, exp.location])),
      ...(exp.bullets || []).map((bullet) => buildBullet(bullet)),
      exp.tech?.length ? buildText(`Tech: ${exp.tech.join(', ')}`) : buildText('')
    ]),
    resume?.projects?.length ? buildHeading('Projects', HeadingLevel.HEADING_2) : buildText(''),
    ...(resume?.projects || []).flatMap((project) => [
      buildText(project.name || ''),
      project.description ? buildText(project.description) : buildText(''),
      ...(project.bullets || []).map((bullet) => buildBullet(bullet)),
      project.tech?.length ? buildText(`Tech: ${project.tech.join(', ')}`) : buildText(''),
      project.link ? buildText(project.link) : buildText('')
    ]),
    resume?.education?.length ? buildHeading('Education', HeadingLevel.HEADING_2) : buildText(''),
    ...(resume?.education || []).map((edu) =>
      buildText(joinNonEmpty([edu.degree, edu.school, edu.dates, edu.location]))
    ),
    resume?.certifications?.length ? buildHeading('Certifications', HeadingLevel.HEADING_2) : buildText(''),
    ...(resume?.certifications || []).map((cert) =>
      buildText(joinNonEmpty([cert.name, cert.issuer, cert.date]))
    )
  ];

  const docChildren =
    template === 'split'
      ? [
          ...headerBlock,
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 60, type: WidthType.PERCENTAGE },
                    children: [
                      resume?.experience?.length
                        ? buildHeading('Experience', HeadingLevel.HEADING_2)
                        : buildText(''),
                      ...(resume?.experience || []).flatMap((exp) => [
                        buildText(joinNonEmpty([exp.role, exp.company, exp.dates, exp.location])),
                        ...(exp.bullets || []).map((bullet) => buildBullet(bullet)),
                        exp.tech?.length ? buildText(`Tech: ${exp.tech.join(', ')}`) : buildText('')
                      ]),
                      resume?.education?.length
                        ? buildHeading('Education', HeadingLevel.HEADING_2)
                        : buildText(''),
                      ...(resume?.education || []).map((edu) =>
                        buildText(joinNonEmpty([edu.degree, edu.school, edu.dates, edu.location]))
                      )
                    ]
                  }),
                  new TableCell({
                    width: { size: 40, type: WidthType.PERCENTAGE },
                    children: [
                      resume?.skills?.length
                        ? buildHeading('Skills', HeadingLevel.HEADING_2)
                        : buildText(''),
                      ...(resume?.skills || []).flatMap((group) => [
                        buildText(group.name || 'Skills'),
                        buildText((group.items || []).join(', '))
                      ]),
                      resume?.projects?.length
                        ? buildHeading('Projects', HeadingLevel.HEADING_2)
                        : buildText(''),
                      ...(resume?.projects || []).flatMap((project) => [
                        buildText(project.name || ''),
                        project.description ? buildText(project.description) : buildText(''),
                        ...(project.bullets || []).map((bullet) => buildBullet(bullet)),
                        project.tech?.length ? buildText(`Tech: ${project.tech.join(', ')}`) : buildText('')
                      ]),
                      resume?.certifications?.length
                        ? buildHeading('Certifications', HeadingLevel.HEADING_2)
                        : buildText(''),
                      ...(resume?.certifications || []).map((cert) =>
                        buildText(joinNonEmpty([cert.name, cert.issuer, cert.date]))
                      )
                    ]
                  })
                ]
              })
            ]
          })
        ]
      : [...headerBlock, ...classicBlocks];

  const doc = new Document({
    sections: [
      {
        children: docChildren.filter((paragraph) => paragraph !== null)
      }
    ]
  });

  return Packer.toBuffer(doc);
}

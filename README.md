# Resume Repository Structure

## Modular Structure

This resume uses a modular LaTeX structure for easy maintenance and updates.

### Files

```
resume/
├── main.tex                              # Main file (compile this)
├── sections/
│   ├── heading.tex                       # Contact information
│   ├── summary.tex                       # Professional summary
│   ├── education.tex                     # Education section
│   ├── experience.tex                    # Work experience
│   ├── projects.tex                      # Projects section
│   └── skills.tex                        # Technical skills
├── Ayush_Jaipuriyar_single_file.tex      # Single-file version (backup)
├── .github/workflows/publish.yml         # GitHub Actions workflow
├── Healthtrip.md                         # Detailed work history
├── RESUME_OPTIMIZATION_SUMMARY.md        # Optimization notes
└── README.md                             # This file
```

### How to Compile

**Option 1: Using the modular structure (recommended)**
```bash
pdflatex main.tex
# Output: main.pdf (rename to Ayush_Jaipuriyar_Resume.pdf)
```

**Option 2: Using the single-file version**
```bash
pdflatex Ayush_Jaipuriyar_single_file.tex
# Output: Ayush_Jaipuriyar_single_file.pdf (rename to Ayush_Jaipuriyar_Single_File_Resume.pdf)
```

### GitHub Actions (Automated)

The workflow automatically:
1. Compiles both modular and single-file versions
2. Renames outputs to `Ayush_Jaipuriyar_Resume.pdf` and `Ayush_Jaipuriyar_Single_File_Resume.pdf`
3. Creates a GitHub Release with both PDFs
4. Deploys to GitHub Pages for permanent access

**Output files:**
- `Ayush_Jaipuriyar_Resume.pdf` - Modular version (recommended)
- `Ayush_Jaipuriyar_Single_File_Resume.pdf` - Single-file backup

### How to Update

**To update a specific section:**
1. Edit the corresponding file in `sections/` directory
2. Push to main branch (GitHub Actions will auto-compile)
3. Or compile locally: `pdflatex main.tex`

**Example: Update experience**
```bash
# Edit the experience section
vim sections/experience.tex

# Push to trigger GitHub Actions
git add .
git commit -m "Update experience section"
git push origin main

# Or compile locally
pdflatex main.tex
mv main.pdf Ayush_Jaipuriyar_Resume.pdf
```

### Benefits of Modular Structure

1. **Easier maintenance**: Update one section without touching others
2. **Version control**: Git diffs are cleaner when sections are separate files
3. **Reusability**: Can mix and match sections for different versions
4. **Organization**: Each section is self-contained and documented
5. **Collaboration**: Multiple people can work on different sections simultaneously
6. **Automation**: GitHub Actions automatically compiles and deploys on push

### Section Files Explained

#### `sections/heading.tex`
Contains contact information: name, phone, email, location, and links (portfolio, LinkedIn, GitHub).

#### `sections/summary.tex`
Professional summary with ATS-optimized keywords for software engineering roles.

#### `sections/education.tex`
Education history with university, degree, and dates.

#### `sections/experience.tex`
Work experience with quantified achievements for:
- Seabuddy (Full Stack Software Developer)
- Healthtrip (Full Stack Software Engineer)
- AST Consulting (Software Developer)

#### `sections/projects.tex`
Technical projects with GitHub links and impact metrics.

#### `sections/skills.tex`
Technical skills organized by category for ATS parsing.

### Customization

**To add a new section:**
1. Create a new file in `sections/` (e.g., `certifications.tex`)
2. Add `\input{sections/certifications}` to `main.tex`
3. Recompile

**To remove a section:**
1. Comment out or delete the `\input` line in `main.tex`
2. Optionally delete the section file
3. Recompile

### Backup

The file `Ayush_Jaipuriyar_single_file.tex` contains the complete resume in a single file. Use this as a backup or if you prefer a non-modular structure.

### ATS Compliance

This resume is optimized for Applicant Tracking Systems (ATS):
- ✅ Plain-text technical skills (not tables)
- ✅ Standard section headers
- ✅ ATS-parseable phone format
- ✅ High-frequency keywords included
- ✅ PDF encoding enabled (`\pdfgentounicode=1`)
- ✅ Output named professionally: `Ayush_Jaipuriyar_Resume.pdf`

### Last Updated

- Optimized with `resume-bullet-writer` and `tech-resume-optimizer` skills
- All achievements have quantifiable metrics
- Technical skills reorganized for better ATS parsing
- GitHub Actions workflow updated for modular structure
- Output PDFs renamed to `Ayush_Jaipuriyar_Resume.pdf` and `Ayush_Jaipuriyar_Single_File_Resume.pdf`
- GitHub Pages deployment enabled for permanent access

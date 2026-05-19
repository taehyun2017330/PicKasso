"""Paper-figure-style diagram of the post-feedback steering flow.

Follows one concrete example all the way through:
  user reacts to the board
  → decision engine classifies the turn
  → trace node updates (parent stores decision; child created)
  → orchestrator writes the refine prompt with the actual values plugged in.
"""

from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import math

# -----------------------------------------------------------------------------
# Canvas & style
# -----------------------------------------------------------------------------

W, H = 3000, 1560
BG = (255, 255, 255)
TEXT = (28, 28, 32)
MUTED = (110, 110, 118)
LINE = (60, 60, 66)
SOFT = (242, 242, 244)
SOFTER = (250, 250, 251)
ACCENT = (32, 110, 80)
ACCENT_FILL = (228, 240, 234)
HIGHLIGHT = (252, 247, 230)
LIKE = (40, 130, 75)
DISLIKE = (180, 55, 60)
SKIP = (175, 175, 180)

# Open Sans variable font (weight axis 300–800).
HERE = Path(__file__).resolve().parent
FONT_PATH = str(HERE / "fonts" / "OpenSans-Variable.ttf")
FONT_MONO = "/System/Library/Fonts/SFNSMono.ttf"

def load(size, weight=400, mono=False):
    """Load an Open Sans face at the requested weight via variable-font axis.

    Convenience flags map to weights: regular=400, medium=500, semibold=600,
    bold=700, heavy=800.
    """
    try:
        if mono:
            return ImageFont.truetype(FONT_MONO, size)
        f = ImageFont.truetype(FONT_PATH, size)
        try:
            f.set_variation_by_axes([weight, 100])  # weight, width (100 = normal)
        except Exception:
            pass
        return f
    except (OSError, IOError):
        return ImageFont.load_default()

f_title    = load(44, weight=700)
f_subtitle = load(20, weight=500)
f_section  = load(26, weight=700)
f_panel    = load(24, weight=700)
f_box      = load(20, weight=700)
f_body     = load(18, weight=400)
f_body_md  = load(18, weight=500)
f_small    = load(15, weight=400)
f_small_md = load(15, weight=600)
f_legend   = load(14, weight=400)
f_mono     = load(16, mono=True)
f_mono_sm  = load(14, mono=True)
f_huge     = load(58, weight=700)

img = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(img)

# -----------------------------------------------------------------------------
# Drawing helpers
# -----------------------------------------------------------------------------

def text_size(text, font):
    bbox = d.textbbox((0, 0), text, font=font)
    return bbox[2] - bbox[0], bbox[3] - bbox[1]

def rounded_box(x, y, w, h, fill=SOFT, outline=LINE, width=2, radius=14):
    d.rounded_rectangle([x, y, x + w, y + h], radius=radius, fill=fill, outline=outline, width=width)

def centered_text(cx, cy, text, font, fill=TEXT):
    tw, th = text_size(text, font)
    d.text((cx - tw / 2, cy - th / 2), text, font=font, fill=fill)

def left_text(x, y, text, font, fill=TEXT):
    d.text((x, y), text, font=font, fill=fill)

def arrow(x1, y1, x2, y2, color=LINE, width=3, head=16):
    d.line([(x1, y1), (x2, y2)], fill=color, width=width)
    angle = math.atan2(y2 - y1, x2 - x1)
    a1 = angle + math.radians(150)
    a2 = angle - math.radians(150)
    p1 = (x2 + head * math.cos(a1), y2 + head * math.sin(a1))
    p2 = (x2 + head * math.cos(a2), y2 + head * math.sin(a2))
    d.polygon([(x2, y2), p1, p2], fill=color)

def wrap(text, font, max_w):
    words = text.split(" ")
    lines, cur = [], ""
    for w in words:
        trial = (cur + " " + w).strip()
        tw, _ = text_size(trial, font)
        if tw <= max_w or not cur:
            cur = trial
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines

def draw_lines(x, y, lines, font, line_height=None, fill=TEXT):
    if line_height is None:
        _, th = text_size("Mg", font)
        line_height = int(th * 1.4)
    for i, line in enumerate(lines):
        d.text((x, y + i * line_height), line, font=font, fill=fill)
    return y + len(lines) * line_height

# -----------------------------------------------------------------------------
# Header
# -----------------------------------------------------------------------------

centered_text(W / 2, 56, "From board feedback to the next prompt",
              f_title)
centered_text(W / 2, 104,
              "One example end-to-end: user likes Variant 3, dislikes Variant 5, skips the rest",
              f_subtitle, fill=MUTED)

# -----------------------------------------------------------------------------
# Layout — 3 panels horizontally
# -----------------------------------------------------------------------------

panel_top = 150
panel_h = 1340
gap = 240  # wide enough to hold a data-envelope + visible arrows on each side
p1_x, p1_w = 60, 740
p2_x, p2_w = p1_x + p1_w + gap, 780
p3_x, p3_w = p2_x + p2_w + gap, W - 60 - (p2_x + p2_w + gap)

# Background panels
for (x, w) in [(p1_x, p1_w), (p2_x, p2_w), (p3_x, p3_w)]:
    rounded_box(x, panel_top, w, panel_h, fill=SOFTER, outline=LINE, width=2, radius=18)

# Stage numbers + headers
def stage_header(x, w, number, title, sub):
    # Number sits in a soft circle for a cleaner, more "paper-figure" feel.
    cx, cy, r = x + 60, panel_top + 60, 32
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=ACCENT_FILL, outline=ACCENT, width=2)
    centered_text(cx, cy, str(number), f_panel, fill=ACCENT)
    left_text(x + 116, panel_top + 32, title, f_panel)
    left_text(x + 116, panel_top + 68, sub, f_body, fill=MUTED)
    d.line([(x + 24, panel_top + 116), (x + w - 24, panel_top + 116)], fill=LINE, width=1)

stage_header(p1_x, p1_w, 1, "User reacts to the board",
             "9 variants  ·  1 like  ·  1 dislike  ·  7 skips")
stage_header(p2_x, p2_w, 2, "Decision engine + Trace Node",
             "classifies the turn, stores the decision, makes a child node")
stage_header(p3_x, p3_w, 3, "Orchestrator writes the refine prompt",
             "PlannerInput → 'refine' recipe → JSON schema → 9 prompts")

# -----------------------------------------------------------------------------
# Panel 1 — Board with feedback
# -----------------------------------------------------------------------------

variants = [
    # (label, kind, chips, note)
    ("Var 1", "skip",    None, None),
    ("Var 2", "skip",    None, None),
    ("Var 3", "like",    "warm light · texture-led", "matte texture worked"),
    ("Var 4", "skip",    None, None),
    ("Var 5", "dislike", "too commercial", None),
    ("Var 6", "skip",    None, None),
    ("Var 7", "skip",    None, None),
    ("Var 8", "skip",    None, None),
    ("Var 9", "skip",    None, None),
]

grid_top = panel_top + 140
card_gap = 22
card_w = (p1_w - 2 * 32 - 2 * card_gap) / 3
card_h = 220  # taller to give chips room to wrap above the note line

for i, (label, kind, chips, note) in enumerate(variants):
    r, c = i // 3, i % 3
    cx = p1_x + 32 + c * (card_w + card_gap)
    cy = grid_top + r * (card_h + card_gap)
    # base card
    rounded_box(cx, cy, card_w, card_h, fill=BG, outline=LINE, width=2, radius=12)
    # variant label
    left_text(cx + 14, cy + 12, label, f_box, fill=TEXT)
    # feedback chip in top-right corner
    if kind == "like":
        chip_color, chip_fill, chip_label = LIKE, (228, 240, 232), "✓ liked"
    elif kind == "dislike":
        chip_color, chip_fill, chip_label = DISLIKE, (245, 228, 230), "✗ disliked"
    else:
        chip_color, chip_fill, chip_label = SKIP, (242, 242, 244), "– skipped"
    tw, _ = text_size(chip_label, f_small_md)
    chip_x = cx + card_w - tw - 24
    chip_y = cy + 14
    d.rounded_rectangle([chip_x - 10, chip_y - 6, chip_x + tw + 10, chip_y + 22],
                        radius=11, fill=chip_fill, outline=chip_color, width=1)
    d.text((chip_x, chip_y - 1), chip_label, font=f_small_md, fill=chip_color)

    # body: chips + note for liked/disliked
    if chips:
        chip_lines = wrap(chips, f_body, card_w - 28)
        chips_top = cy + 64
        chips_bottom = draw_lines(cx + 14, chips_top, chip_lines, f_body, line_height=22, fill=TEXT)
    else:
        chips_bottom = cy + 64

    if note:
        # place "note" label below the chips with a fixed spacer so wrapped
        # chips push the note downward instead of overlapping it.
        note_label_y = max(chips_bottom + 14, cy + 130)
        d.text((cx + 14, note_label_y), "note", f_small_md, fill=MUTED) if False else None
        left_text(cx + 14, note_label_y, "note", f_small_md, fill=MUTED)
        note_lines = wrap('"' + note + '"', f_body, card_w - 28)
        draw_lines(cx + 14, note_label_y + 22, note_lines, f_body, line_height=22, fill=TEXT)
    if kind == "skip":
        # subtle dashed center to mark skipped
        cx_mid = cx + card_w / 2
        cy_mid = cy + card_h / 2 + 10
        d.line([(cx_mid - 24, cy_mid), (cx_mid + 24, cy_mid)], fill=SKIP, width=3)

# Follow-up question box at bottom of panel 1
followup_top = grid_top + 3 * card_h + 2 * card_gap + 28
fu_x = p1_x + 32
fu_w = p1_w - 64
fu_h = 130
rounded_box(fu_x, followup_top, fu_w, fu_h, fill=BG, outline=ACCENT, width=2, radius=12)
left_text(fu_x + 18, followup_top + 14, "Follow-up question", f_box)
qa_lines = [
    ('Q:', '"What feels closest?"'),
    ('A:', '"warm light, texture-led"  (multi-select chips)'),
]
for i, (k, v) in enumerate(qa_lines):
    left_text(fu_x + 18, followup_top + 50 + i * 26, k, f_body, fill=MUTED)
    left_text(fu_x + 50, followup_top + 50 + i * 26, v, f_body, fill=TEXT)

# -- Data envelope between Panel 1 and Panel 2 --
env1_cx = (p1_x + p1_w + p2_x) / 2
env1_w  = 180
env1_h  = 200
env1_top = panel_top + panel_h / 2 - env1_h / 2
env1_x = env1_cx - env1_w / 2
rounded_box(env1_x, env1_top, env1_w, env1_h, fill=BG, outline=LINE, width=2, radius=12)
centered_text(env1_cx, env1_top + 22, "data passed →", f_small_md, fill=MUTED)

env1_fields = [
    ("userSignals",     "rating + chips + note"),
    ("feedbackAnswers", "chip choices + text"),
]
fy = env1_top + 56
for key, val in env1_fields:
    left_text(env1_x + 14, fy, key, f_body_md, fill=ACCENT)
    val_lines = wrap(val, f_small, env1_w - 28)
    for j, line in enumerate(val_lines):
        left_text(env1_x + 14, fy + 24 + j * 18, line, f_small, fill=MUTED)
    fy += 24 + len(val_lines) * 18 + 18

# arrows into and out of the envelope
arrow_y = panel_top + panel_h / 2
arrow(p1_x + p1_w + 6, arrow_y, env1_x - 6, arrow_y, color=LINE, width=3, head=14)
arrow(env1_x + env1_w + 6, arrow_y, p2_x - 6, arrow_y, color=LINE, width=3, head=14)

# -----------------------------------------------------------------------------
# Panel 2 — Decision engine + Trace node
# -----------------------------------------------------------------------------

p2_inner_x = p2_x + 30
p2_inner_w = p2_w - 60

# 2a. Decision Engine sub-box
de_top = panel_top + 140
de_h = 640
rounded_box(p2_inner_x, de_top, p2_inner_w, de_h, fill=BG, outline=LINE, width=2, radius=12)
left_text(p2_inner_x + 22, de_top + 18, "Decision Engine", f_box)
left_text(p2_inner_x + 22, de_top + 50, "lib/feedback/decisionEngine.ts", f_small, fill=MUTED)

# Helper for numbered step badges
def step_badge(cx, cy, n, r=15):
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=ACCENT_FILL, outline=ACCENT, width=2)
    centered_text(cx, cy, str(n), f_small_md, fill=ACCENT)

# Step rail: vertical line on the left connecting the three badges
rail_x = p2_inner_x + 38

# Step 1 — Reads
s1_y = de_top + 96
step_badge(rail_x, s1_y, 1)
left_text(rail_x + 28, s1_y - 12, "Reads what the user did this turn", f_body_md, fill=ACCENT)
reads = [
    "•  1 liked  (Var 3)  + chips + free-text note",
    "•  1 disliked  (Var 5)  + chip",
    "•  7 skipped  variants",
    "•  follow-up answer  (multi-select chips)",
]
for i, line in enumerate(reads):
    left_text(rail_x + 28, s1_y + 22 + i * 24, line, f_body, fill=TEXT)
s1_bottom = s1_y + 22 + len(reads) * 24

# Down arrow 1
arrow(rail_x, s1_bottom + 8, rail_x, s1_bottom + 38, color=ACCENT, width=2, head=10)
# small caption next to this arrow
left_text(rail_x + 28, s1_bottom + 14,
          "feeds into the classifier", f_small, fill=MUTED)

# Step 2 — Classifies
s2_y = s1_bottom + 60
step_badge(rail_x, s2_y, 2)
left_text(rail_x + 28, s2_y - 12, "Classifies the situation", f_body_md, fill=ACCENT)
left_text(rail_x + 28, s2_y + 22,
          'situation = "oneLikedRestDisliked"', f_mono, fill=TEXT)
s2_bottom = s2_y + 48

# Down arrow 2
arrow(rail_x, s2_bottom + 8, rail_x, s2_bottom + 38, color=ACCENT, width=2, head=10)
left_text(rail_x + 28, s2_bottom + 14,
          "situation → mode + intent template", f_small, fill=MUTED)

# Step 3 — Emits
s3_y = s2_bottom + 60
step_badge(rail_x, s3_y, 3)
left_text(rail_x + 28, s3_y - 12,
          "Emits NextGenerationDecision", f_body_md, fill=ACCENT)
decision_lines = [
    '{',
    '  mode: "refine",',
    '  promptIntent: "Refine around Var 3;',
    '    preserve warm light + matte',
    '    texture; avoid rejected traits.",',
    '  nextOutputCount: 9,',
    '  memoryUpdate: "One image worked..."',
    '}',
]
for i, line in enumerate(decision_lines):
    left_text(rail_x + 28, s3_y + 22 + i * 22, line, f_mono_sm, fill=TEXT)

# 2b. Trace Node updates sub-box
tn_top = de_top + de_h + 30
tn_h = panel_top + panel_h - 50 - tn_top
rounded_box(p2_inner_x, tn_top, p2_inner_w, tn_h, fill=BG, outline=LINE, width=2, radius=12)
left_text(p2_inner_x + 22, tn_top + 18, "Trace Node updates", f_box)
left_text(p2_inner_x + 22, tn_top + 50, "store/actions/nodeLifecycleActions.ts", f_small, fill=MUTED)

# Parent stores decision
y = tn_top + 90
left_text(p2_inner_x + 22, y, "Parent node", f_body, fill=ACCENT)
left_text(p2_inner_x + 28, y + 28, "parent.decision  ←  decision object",
          f_mono, fill=TEXT)

# Child created
y = tn_top + 160
left_text(p2_inner_x + 22, y, "New child node (createChildNode)", f_body, fill=ACCENT)
child_lines = [
    "parentNodeIds:    [parent.id]",
    "parentVariantIds: [Var 3.id]",
    'mode:             "narrow"   ← projected from "refine"',
    "userPrompt:       decision.promptIntent",
    "outputCount:      9",
]
for i, line in enumerate(child_lines):
    left_text(p2_inner_x + 28, y + 30 + i * 22, line, f_mono_sm, fill=TEXT)

# Highlighted: when the child plans, it looks back at parent
y = y + 30 + len(child_lines) * 22 + 24
hl_box_h = 84
d.rounded_rectangle([p2_inner_x + 16, y - 8, p2_inner_x + p2_inner_w - 16, y + hl_box_h],
                    radius=10, fill=ACCENT_FILL, outline=ACCENT, width=2)
left_text(p2_inner_x + 28, y + 4, "When the child's planner runs:", f_body, fill=ACCENT)
left_text(p2_inner_x + 28, y + 32,
          "runNode looks up parent.decision  →  passes it through as", f_body, fill=TEXT)
left_text(p2_inner_x + 28, y + 54,
          "originatingDecision in PlannerInput  (the new channel)", f_mono, fill=ACCENT)

# -- Data envelope between Panel 2 and Panel 3 --
env2_cx = (p2_x + p2_w + p3_x) / 2
env2_w  = 180
env2_h  = 490
env2_top = panel_top + panel_h / 2 - env2_h / 2
env2_x = env2_cx - env2_w / 2
rounded_box(env2_x, env2_top, env2_w, env2_h, fill=BG, outline=ACCENT, width=2, radius=12)
centered_text(env2_cx, env2_top + 24, "PlannerInput", f_body_md, fill=ACCENT)
centered_text(env2_cx, env2_top + 48, "(what the planner reads)", f_small, fill=MUTED)
env2_fields = [
    ("brand",                 "name, category, goal, audience"),
    ("traceMemory",           "warm / cold signals, ancestry"),
    ("selectedVariants",      "parents + their feedback"),
    ("userPrompt",            "= decision.promptIntent"),
    ("originatingDecision",   "9-mode decision from parent"),
]
fy = env2_top + 92
val_max_w = env2_w - 28
for i, (key, val) in enumerate(env2_fields):
    is_new = key == "originatingDecision"
    val_lines = wrap(val, f_small, val_max_w)
    # block_h accounts for: key (22) + val lines (18 each) + (for "new" only)
    # a 22-px row holding the "← new channel" tag with clear top spacing.
    block_h = 22 + len(val_lines) * 18 + (22 if is_new else 0)
    if is_new:
        d.rounded_rectangle(
            [env2_x + 8, fy - 10, env2_x + env2_w - 8, fy + block_h + 12],
            radius=8, fill=ACCENT_FILL, outline=ACCENT, width=2,
        )
    left_text(env2_x + 14, fy, key, f_body_md, fill=ACCENT if is_new else TEXT)
    for j, line in enumerate(val_lines):
        left_text(env2_x + 14, fy + 24 + j * 18, line, f_small, fill=MUTED)
    if is_new:
        left_text(env2_x + 14, fy + 24 + len(val_lines) * 18 + 8,
                  "← new channel", f_legend, fill=ACCENT)
    fy += block_h + (22 if is_new else 16)

# arrows into and out of the envelope
arrow(p2_x + p2_w + 6, arrow_y, env2_x - 6, arrow_y, color=LINE, width=3, head=14)
arrow(env2_x + env2_w + 6, arrow_y, p3_x - 6, arrow_y, color=LINE, width=3, head=14)

# -----------------------------------------------------------------------------
# Panel 3 — The refine prompt with example values
# -----------------------------------------------------------------------------

p3_inner_x = p3_x + 30
p3_inner_w = p3_w - 60

prompt_box_top = panel_top + 140
prompt_box_h = panel_top + panel_h - 50 - prompt_box_top
rounded_box(p3_inner_x, prompt_box_top, p3_inner_w, prompt_box_h,
            fill=BG, outline=ACCENT, width=2, radius=12)

# Header inside prompt box
left_text(p3_inner_x + 22, prompt_box_top + 18,
          "buildRefinePrompt(input)", f_box, fill=ACCENT)
left_text(p3_inner_x + 22, prompt_box_top + 48,
          "lib/ai/promptOrchestrator.ts", f_small, fill=MUTED)

# Prompt sections — each has a heading + filled-in body
prompt_sections = [
    ("INPUTS", [
        "Brand:    Mira Crust",
        "Category: bakery",
        "Audience: office commuters",
        "Goal:     product imagery",
    ]),
    ("USER INTENT", [
        '"Refine around Var 3; preserve warm light',
        ' and matte texture; avoid rejected traits."',
        "(from decision.promptIntent + userPrompt)",
    ]),
    ("LIKED ANCHOR", [
        'Label:   "Warm croissant hero"',
        "Reasons: warm light, texture-led",
        'Note:    "matte texture worked"',
    ]),
    ("WARM TRAITS TO PRESERVE", [
        "•  warm light",
        "•  matte texture",
        "(from traceMemory.warmSignals)",
    ]),
    ("COLD TRAITS TO AVOID", [
        "•  too commercial   ← Var 5",
        "(from traceMemory.coldSignals)",
    ]),
    ("OBJECTIVE", [
        "stay close to anchor's visual core",
        "vary in peripherals (framing, subject moment)",
        "amplify warm, remove cold, don't drift",
    ]),
    ("OUTPUT FORMAT", [
        "JSON  { prompts: [×9] }",
        "each item: { name, description,",
        "             prompt_for_image_model }",
    ]),
]

section_pad_top = prompt_box_top + 92
available_h = prompt_box_h - 92 - 30
n_sections = len(prompt_sections)
# compute each section's height by content
section_blocks = []
heading_h = 28
line_h = 22
gap_after_heading = 6
inter_section_gap = 14
for head, body in prompt_sections:
    body_h = len(body) * line_h
    total = heading_h + gap_after_heading + body_h
    section_blocks.append(total)
total_content = sum(section_blocks) + (n_sections - 1) * inter_section_gap
# if it overflows, scale gap down (it shouldn't with our sizing)
if total_content > available_h:
    inter_section_gap = max(6, (available_h - sum(section_blocks)) / max(1, n_sections - 1))
    total_content = sum(section_blocks) + (n_sections - 1) * inter_section_gap

y = section_pad_top
for (head, body), block_h in zip(prompt_sections, section_blocks):
    left_text(p3_inner_x + 28, y, head, f_body, fill=ACCENT)
    by = y + heading_h
    for i, line in enumerate(body):
        font = f_mono_sm if any(ch in line for ch in [":", "{", "•", "←", "(", '"']) else f_body
        left_text(p3_inner_x + 34, by + i * line_h, line, font, fill=TEXT)
    y += block_h + inter_section_gap

# Footer
centered_text(W / 2, H - 30,
              "files: lib/ai/promptOrchestrator.ts  ·  components/generation/runNode.ts  ·  lib/feedback/decisionEngine.ts",
              f_legend, fill=MUTED)

# -----------------------------------------------------------------------------
# Save
# -----------------------------------------------------------------------------

out_path = Path(__file__).resolve().parent / "orchestrator_architecture.png"
img.save(out_path, "PNG", optimize=True)
print(f"wrote {out_path}  ({W}x{H})")

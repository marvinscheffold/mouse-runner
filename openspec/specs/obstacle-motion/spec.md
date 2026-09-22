# obstacle-motion Specification

## Purpose

Describes which obstacles appear in a run, when hunters unlock, how they are colored, and how strongly they pull toward the cursor.

## Requirements

### Requirement: Straight and hunting obstacles only
The system SHALL spawn only straight obstacles and hunting obstacles. The system MUST NOT spawn curved obstacles.

#### Scenario: Any spawn
- **WHEN** an obstacle is spawned at any score
- **THEN** its motion is straight or hunting

### Requirement: Hunters unlock at score 10000
The system SHALL spawn only straight obstacles while the score is below 10000. At a score of 10000 or higher, the system SHALL be able to spawn hunting obstacles.

#### Scenario: Before the hunter unlock
- **WHEN** the score is below 10000
- **THEN** every spawned obstacle is straight

#### Scenario: At the hunter unlock
- **WHEN** the score reaches 10000
- **THEN** a spawned obstacle can be a hunter

### Requirement: Hunter spawn share is unchanged
Once hunters are unlocked, the chance a spawn is a hunter SHALL be 0.10. That chance SHALL increase linearly to 0.25 across the next 30000 score and SHALL stay at 0.25 after that. The system MUST NOT raise this chance to replace the spawns curved obstacles used to take.

#### Scenario: Chance at unlock
- **WHEN** an obstacle is spawned at score 10000
- **THEN** the chance it is a hunter is 0.10

#### Scenario: Chance at the end of the ramp
- **WHEN** an obstacle is spawned at score 40000 or higher
- **THEN** the chance it is a hunter is 0.25

### Requirement: Hunters use the shared palette
A hunting obstacle SHALL be colored from the same palette as a straight obstacle. The system MUST NOT assign hunters a single dedicated color. A drawn hunter MUST show a glow and a light edge so it stays distinct from a straight obstacle of the same color.

#### Scenario: Palette fill
- **WHEN** a hunting obstacle is spawned
- **THEN** its color is one of the shared obstacle palette colors

#### Scenario: Still readable as a hunter
- **WHEN** a hunting obstacle is drawn
- **THEN** it shows a glowing palette-colored fill with a light edge

### Requirement: Hunt pull is slightly stronger and cannot reverse
At the unlock score, a hunter's pull toward the cursor SHALL be 0.55. That pull SHALL increase linearly to 0.70 across the next 30000 score and SHALL stay at 0.70 after that. The pull MUST stay weaker than the launch heading, so a hunter continues across the scene and cannot turn around to follow the cursor.

#### Scenario: Pull at unlock
- **WHEN** a hunter is spawned at score 10000
- **THEN** its pull strength is 0.55

#### Scenario: Pull at the end of the ramp
- **WHEN** a hunter is spawned at score 40000 or higher
- **THEN** its pull strength is 0.70

#### Scenario: Cursor is behind the hunter
- **WHEN** the cursor is directly behind a hunter's launch heading
- **THEN** the hunter keeps traveling toward the far side of the scene

### Requirement: Hunters stay slower and smaller
A hunter SHALL be spawned at 0.7 times the size of a straight obstacle at the same difficulty. A hunter's speed factor SHALL be 0.55 at the unlock score, SHALL increase linearly to 0.75 across the next 30000 score, and SHALL stay at 0.75 after that.

#### Scenario: Size at any score after unlock
- **WHEN** a hunter is spawned
- **THEN** its size range is 0.7 times the straight-obstacle size range at that difficulty

#### Scenario: Speed at unlock
- **WHEN** a hunter is spawned at score 10000
- **THEN** its speed factor is 0.55

#### Scenario: Speed at the end of the ramp
- **WHEN** a hunter is spawned at score 40000 or higher
- **THEN** its speed factor is 0.75

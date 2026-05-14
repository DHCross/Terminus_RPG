import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Divider,
  Grid,
  H1,
  H2,
  H3,
  Pill,
  Row,
  Stack,
  Stat,
  Text,
  useCanvasState,
  useHostTheme,
} from "cursor/canvas";

const pairs = [
  {
    skill: "Force",
    threshold: "Endure",
    die: "d10",
    circles: 4,
    lost: 1,
    broken: "Cracked, Bloodied, Pinned",
  },
  {
    skill: "Agility",
    threshold: "Avoid",
    die: "d8",
    circles: 3,
    lost: 2,
    broken: "Driven Back, Exposed, Cornered",
  },
  {
    skill: "Willpower",
    threshold: "Exert",
    die: "d6",
    circles: 2,
    lost: 0,
    broken: "Shaken, Compromised, Overextended",
  },
];

const permissions = ["Seal", "Expose", "Bridge", "Nullify"];

function PressureCircles({
  total,
  lost,
  onSetLost,
}: {
  total: number;
  lost: number;
  onSetLost: (lost: number) => void;
}) {
  const theme = useHostTheme();

  return (
    <Row gap={6} align="center">
      {Array.from({ length: total }).map((_, index) => (
        <button
          key={index}
          type="button"
          aria-label={`Set lost pressure to ${index + 1}`}
          onClick={() => onSetLost(index + 1 === lost ? index : index + 1)}
          style={{
            width: 14,
            height: 14,
            borderRadius: 999,
            border: `1px solid ${theme.stroke.secondary}`,
            background: index < total - lost ? theme.fill.primary : theme.diff.removedLine,
            cursor: "pointer",
            padding: 0,
          }}
        />
      ))}
    </Row>
  );
}

function BreakPrompt({ children }: { children: string }) {
  const theme = useHostTheme();

  return (
    <div
      style={{
        border: `1px solid ${theme.stroke.tertiary}`,
        background: theme.diff.removedLine,
        borderRadius: 6,
        padding: "6px 8px",
      }}
    >
      <Text size="small" tone="secondary">
        Threshold broken: <Text as="span" weight="semibold">{children}</Text>
      </Text>
    </div>
  );
}

function PairBand({
  skill,
  threshold,
  die,
  circles,
  lost,
  broken,
  onSetLost,
}: (typeof pairs)[number] & { onSetLost: (lost: number) => void }) {
  const theme = useHostTheme();
  const isBroken = lost >= circles;

  return (
    <Grid columns="1fr 72px 1fr" gap={10} align="stretch">
      <Card>
        <CardHeader trailing={<Pill size="sm">Act</Pill>}>{skill}</CardHeader>
        <CardBody>
          <Text tone="secondary" size="small">
            Current die rank
          </Text>
          <Text
            weight="bold"
            style={{ fontSize: 24, lineHeight: "28px", color: theme.text.primary }}
          >
            {die}
          </Text>
        </CardBody>
      </Card>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: theme.text.tertiary,
          fontSize: 12,
        }}
      >
        paired
      </div>

      <Card>
        <CardHeader
          trailing={
            <Pill size="sm" tone={isBroken ? "deleted" : "neutral"}>
              {isBroken ? "Broken" : "Resist"}
            </Pill>
          }
        >
          {threshold}
        </CardHeader>
        <CardBody>
          <Stack gap={8}>
            <PressureCircles total={circles} lost={lost} onSetLost={onSetLost} />
            <Text size="small" tone="tertiary">
              {circles - lost} open / {lost} lost
            </Text>
            <BreakPrompt>{broken}</BreakPrompt>
          </Stack>
        </CardBody>
      </Card>
    </Grid>
  );
}

function LedgerControl({
  label,
  value,
  onDecrease,
  onIncrease,
  tone,
}: {
  label: string;
  value: string;
  onDecrease: () => void;
  onIncrease: () => void;
  tone?: "warning" | "info";
}) {
  return (
    <Card>
      <CardHeader
        trailing={tone ? <Pill size="sm" tone={tone}>{tone}</Pill> : undefined}
      >
        {label}
      </CardHeader>
      <CardBody>
        <Row gap={10} align="center" justify="space-between">
          <Text weight="bold" style={{ fontSize: 20, lineHeight: "24px" }}>
            {value}
          </Text>
          <Row gap={6}>
            <Button variant="secondary" onClick={onDecrease}>-</Button>
            <Button variant="secondary" onClick={onIncrease}>+</Button>
          </Row>
        </Row>
      </CardBody>
    </Card>
  );
}

export default function TerminusCompactCharacterSheet() {
  const [ap, setAp] = useCanvasState("available-ap", 4);
  const [drift, setDrift] = useCanvasState("scene-drift", 3);
  const [lostByThreshold, setLostByThreshold] = useCanvasState<Record<string, number>>(
    "lost-threshold-circles",
    Object.fromEntries(pairs.map((pair) => [pair.threshold, pair.lost]))
  );

  return (
    <Stack gap={18}>
      <Stack gap={6}>
        <H1>Terminus Compact Character Sheet</H1>
        <Text tone="secondary">
          A compact digital template that makes each acting Skill face its paired Threshold, with
          break prompts visible at the moment pressure runs out.
        </Text>
      </Stack>

      <Grid columns={3} gap={12}>
        <LedgerControl
          label="Available AP"
          value={`${ap} AP`}
          onDecrease={() => setAp((value) => Math.max(0, value - 1))}
          onIncrease={() => setAp((value) => value + 1)}
        />
        <Stat value="After operation" label="Next AP trigger" />
        <LedgerControl
          label="Scene Pressure"
          value={`${drift} Drift`}
          tone="warning"
          onDecrease={() => setDrift((value) => Math.max(0, value - 1))}
          onIncrease={() => setDrift((value) => value + 1)}
        />
      </Grid>

      <H2>Paired Wings</H2>
      <Stack gap={10}>
        {pairs.map((pair) => {
          const lost = lostByThreshold[pair.threshold] ?? pair.lost;

          return (
            <PairBand
              key={pair.skill}
              {...pair}
              lost={lost}
              onSetLost={(nextLost) =>
                setLostByThreshold((current) => ({
                  ...current,
                  [pair.threshold]: Math.max(0, Math.min(pair.circles, nextLost)),
                }))
              }
            />
          );
        })}
      </Stack>

      <Grid columns="1.1fr 0.9fr" gap={14}>
        <Card size="lg">
          <CardHeader>Signature</CardHeader>
          <CardBody>
            <Stack gap={10}>
              <H3>War Hammer</H3>
              <Row gap={8} wrap>
                <Pill active>Impact 3</Pill>
                <Pill active tone="warning">Vector: Breaks Protection</Pill>
              </Row>
              <Text tone="secondary" size="small">
                The Signature block should answer what makes the character legible in the scene
                before any ability text is read.
              </Text>
            </Stack>
          </CardBody>
        </Card>

        <Stack gap={12}>
          <H2>Order Permission</H2>
          <Text tone="secondary" size="small">
            Use compact field-function language. Long rules text can live behind an expand action.
          </Text>
          <Row gap={8} wrap>
            {permissions.map((permission) => (
              <Pill key={permission} active tone="warning">
                {permission}
              </Pill>
            ))}
          </Row>
        </Stack>
      </Grid>

      <Divider />

      <Grid columns={2} gap={14}>
        <Stack gap={8}>
          <H2>Drift Ledger</H2>
          <Text>
            Conditions: <Text as="span" weight="semibold">Ash-sick, watched by the breach</Text>
          </Text>
          <Text>
            Environmental pressure:{" "}
            <Text as="span" weight="semibold">Black rain, unstable footing</Text>
          </Text>
        </Stack>

        <Stack gap={8}>
          <H2>Scene Relationship</H2>
          <Text>
            Rupture stance: <Text as="span" weight="semibold">Containing, not cleansing</Text>
          </Text>
          <Text>
            Immediate question: <Text as="span" weight="semibold">What does the breach demand?</Text>
          </Text>
        </Stack>
      </Grid>
    </Stack>
  );
}

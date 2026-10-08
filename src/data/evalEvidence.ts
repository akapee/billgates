// DIBUAT OTOMATIS oleh scripts/eval/run.ts — jangan diedit manual.
export const evalEvidence = {
  "note": "Data sintetis. Dibuat otomatis oleh scripts/eval/run.ts",
  "testClaims": 5026,
  "testDuplicates": 100,
  "chosenThreshold": 80,
  "methods": [
    {
      "name": "Baseline (persis: pasien+dx+tindakan+faskes+tanggal)",
      "flagged": 14,
      "precision": 1,
      "recall": 0.14,
      "f1": 0.24561403508771928,
      "workloadPct": 0.002785515320334262,
      "fp": 0
    },
    {
      "name": "V1 (algoritma proposal lama, ambang 50)",
      "flagged": 2822,
      "precision": 0.03543586109142452,
      "recall": 1,
      "f1": 0.06844626967830253,
      "workloadPct": 0.5614803024273777,
      "fp": 2722
    },
    {
      "name": "V2 (berblok + jendela 21 hari + ID fuzzy, ambang 80)",
      "flagged": 178,
      "precision": 0.5617977528089888,
      "recall": 1,
      "f1": 0.7194244604316548,
      "workloadPct": 0.0354158376442499,
      "fp": 78
    }
  ],
  "latency": [
    {
      "n": 1000,
      "v2": 1.4634340000000066,
      "v1": 23.712614999999914
    },
    {
      "n": 2000,
      "v2": 3.2964630000001307,
      "v1": 127.29574200000002
    },
    {
      "n": 5000,
      "v2": 19.81306399999994,
      "v1": 1133.4400970000002
    },
    {
      "n": 10000,
      "v2": 88.86420899999985,
      "v1": 5221.648507
    },
    {
      "n": 20000,
      "v2": 156.17138199999863
    },
    {
      "n": 50000,
      "v2": 685.871459
    },
    {
      "n": 100000,
      "v2": 2405.473528999999
    },
    {
      "n": 200000,
      "v2": 7967.519157999999
    }
  ]
} as const;

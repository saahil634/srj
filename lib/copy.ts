export const demoCopy = {
  // App metadata and global chrome
  app: {
    title: "SRJ Demo",
    description: "A relational prototype for creating SRJ packages.",
    nav: {
      eyebrow: "Secure Relational Jump (SRJ) Prototype",
      title: "SRJ Demo",
      links: {
        overview: "Overview",
        create: "Create SRJ",
        open: "Open SRJ",
        retrieve: "Retrive SRJ Packages",
        logout: "Logout",
      },
    },
  },

  // Home page
  home: {
    hero: {
      eyebrow: "SRJ Demo",
      title: "A relational prototype for creating SRJ packages.",
      description:
        "This demo showcases a compact two-step story: Data custodians can assemble an SRJ package with a generated manifest, and data recipients can unlock access only after accepting the terms and conditions",
    },
    flows: {
      create: {
        label: "Create SRJ",
        title: "Create SRJ package",
        description:
          "Upload files, define usage terms and conditions, and generate a digital manifest for each media asset.",
      },
      open: {
        label: "Open SRJ",
        title: "Open SRJ package",
        description:
          "Review SRJ package metadata, access records, and agreements made to terms and conditions of use.",
      },
      retrieve: {
        label: "Retrive SRJ Packages",
        title: "Retrive SRJ packages",
        description:
          "Find stored SRJ packages by entering the matching SRJ-access-key, then open or delete only the matching records.",
      },
    },
    launchFlowLabel: "Get Started",
    highlights: {
      eyebrow: "Demo highlights",
      items: [
        "SRJ pages for overview, package creation, and embeddding data goverance protocols.",
        "Upload images, short audio/video files, and documents in PDF or txt.",
        "Recipient users of SRJ packages always accept terms and conditions before unlocking access to file derivatives.",
      ],
    },
    narrative: {
      eyebrow: "Capabilites",
      items: [
        "SRJ package combines images, PDFs, and videos into one governed object.",
        "This demonstration generates a file manifest with package ID, access timestamps, and terms and conditions of use.",
        "Recipients opens the SRJ package, accepts terms, and receives logged access to file derivatives.",
      ],
    },
  },

  // Create page
  createPage: {
    hero: {
      eyebrow: "Create SRJ",
      title: "Build a data governance package in a few clicks",
      description:
        "Upload files and assemble an SRJ package, apply the terms and conditions of use, and generate file manifests that unlocks access to recipients.",
    },
  },

  // Open page
  openPage: {
    hero: {
      eyebrow: "Open SRJ",
      title: "Review the SRJ package, and unlock files after agreeing to terms and conditions of use",
      description:
        "This recipient view keeps file metadata visible while placing file access restricted until and unless the recipient agreeing to terms and conditions of use.",
    },
  },

  // Retrieve page
  retrievePage: {
    hero: {
      eyebrow: "Retrive SRJ Packages",
      title: "Retrive stored SRJ packages by SRJ-access-key",
      description:
        "Use the SRJ-access-key to find matching package records without exposing the full package list by default.",
    },
  },

  // Create flow form
  createForm: {
    eyebrow: "Create SRJ workflow",
    title: "Assemble an SRJ package",
    storageBadge: "SRJ data storage",
    fields: {
      packageTitleLabel: "Package title",
      packageTitlePlaceholder: "Enter a package name",
      termsPresetLabel: "Terms and conditions of use",
      srjRelationLabel: "Uploader SRJ relation reference",
      srjRelationPlaceholder: "Enter your unique SRJ-access-key",
      srjRelationHelp:
        "This unique relation becomes the package's SRJ-acces-key reference in the file manifest of every file in the compressed package.",
    },
    defaultTitle: "Name of the Dataset",
    defaultTermsPreset: "Public research, education, and non-commercial use only.",
    defaultSrjRelation: "14 | yes | 5+4",
    submitIdle: "Generate SRJ package",
    submitLoading: "Uploading to SRJ demo website...",
    uploadSummaryPrefix:
      "Files are uploaded to SRJ website and file manifests are visisble for demonstration only. Allowed uploads:",
    uploadSummarySuffix: ".",
    successTitlePrefix: "Package created:",
    successBody:
      "The SRJ package is now available, along with the file manifests.",
    successLink: "Continue to Open SRJ →",
    errors: {
      totalUploadLimit: "Total upload size must stay within 10 MB.",
      invalidRelation: "Enter the SRJ-access-key generated for this session, or another non-empty SRJ reference.",
      unableToCreate: "Unable to create the SRJ package.",
    },
  },

  // File upload block
  fileDropzone: {
    dropTitle: "Click here to upload files and assemble an SRJ package",
    dropDescription:
      "Upload multiple images, short audio clips, short video clips, and text documents (.pdf, .txt). Total upload size must stay within 10 MB across the whole package.",
    limitBadge: "10 MB total file size limit",
    selectButton: "Select files",
    allowedPrefix: "Allowed:",
    totalSelectedPrefix: "Total selected:",
    unknownType: "Unknown type",
    removeButton: "Remove",
    allowedLabel:
      "Images, short audio clips, short video clips, and text documents (.pdf, .txt)",
    errors: {
      invalidType:
        "Only images, short audio clips, short video clips, PDFs, and TXT files are allowed.",
      totalUploadLimit: "Total upload size must stay within 10 MB.",
    },
  },

  // Manifest preview panel
  manifestPreview: {
    eyebrow: "File Manifest preview",
    title: "Package object",
    badge: "Live output",
    emptyState: "{\n  // create a package to preview the manifest\n}",
  },

  // Open flow
  openExperience: {
    emptyState: {
      eyebrow: "Open flow",
      loadingTitle: "Loading packages...",
      idleTitle: "No package loaded yet",
      loadingBody:
        "The app is checking SEJ package records so the recipient flow can pick up persisted demos.",
      idleBody:
        "Create an SRJ package first, or paste a manifest JSON to demo the recipient view with metadata, modal acceptance, and governed file access.",
      createLink: "Go to Create SRJ",
    },
    importManifest: {
      eyebrow: "Import manifest",
      title: "Load another package object",
      placeholderTop: 'Paste a package manifest JSON here to simulate "Open SRJ"',
      placeholderBottom: "Paste a manifest to simulate opening a shared package",
      button: "Import manifest",
      createLink: "Create a new package →",
      errors: {
        missingFields: "Manifest is missing required package fields.",
        unableToImport: "Unable to import manifest.",
      },
    },
    packageLoader: {
      eyebrow: "Package loader",
      title: "Active package",
      body: "Open SRJ shows only the package you explicitly created, retrieved, or imported.",
    },
    recipientStatus: {
      eyebrow: "Recipient status",
      unlockedTitle: "Access unlocked",
      lockedTitle: "Awaiting terms acceptance",
      lockedBody:
        "Metadata is visible now. File previews remain blocked until the modal flow is completed.",
      acceptedByPrefix: "Accepted by",
      acceptedOnJoiner: "on",
    },
    governanceNotice: {
      eyebrow: "Data Governance notice",
      body:
        "Datat Governance notice: Access is granted for the accepted use case only. Redistribution, commercial reuse, and downstream rights expansion require a separate review.",
    },
    actions: {
      reviewTerms: "Review and accept terms and conditions of use",
      downloadZip: "Download SRJ package",
    },
    unlockFacts: {
      packageId: "Package ID",
      acceptedAt: "Accepted at",
      governance: "Governance",
      governanceValue: "Derivative SRJ package unlocked",
    },
  },

  // Retrieve flow
  retrieveExperience: {
    lookup: {
      eyebrow: "Package retrieval",
      title: "Find packages by SRJ-access-key",
      body:
        "Enter the SRJ-access-key to retrieve matching package records. Packages remain hidden until a matching key is provided.",
      keyLabel: "SRJ-access-key",
      keyPlaceholder: "Enter the SRJ-access-key used to create the package",
      retrieveButton: "Retrive matching packages",
      retrievingButton: "Retriving packages...",
      emptyResults: "No SRJ packages matched that SRJ-access-key.",
      resultsTitle: "Matching SRJ packages",
      openButton: "Open package",
      deleteButton: "Delete package",
      packageIdLabel: "Package ID",
      keyIdLabel: "SRJ key ID",
      deletePanelTitle: "Delete this package",
      deletePanelBody:
        "To delete a package, confirm the package ID and the same SRJ-access-key used when it was created.",
      confirmDeleteButton: "Confirm delete",
      deletingButton: "Deleting package...",
    },
    errors: {
      missingKey: "Enter an SRJ-access-key to retrieve packages.",
      incorrectKey: "The SRJ-access-key is incorrect.",
      deleteFallback: "Unable to delete the SRJ package.",
    },
  },

  // Metadata card in open flow
  packageMetadata: {
    eyebrow: "SRJ Package metadata",
    labels: {
      createdAt: "Created at",
      termsVersion: "Terms version",
      fileCount: "File count",
      totalPackageSize: "Total package size",
      allowedUses: "Allowed uses",
      noticeText: "Notice text",
      srjKeyReference: "SRJ key reference",
      keyId: "Key ID",
      relation: "Relation",
      targetValue: "Target value",
    },
    targetValueFallback: "Session-derived key",
    assetCountSuffix: "assets",
    srjKeyReferenceBodyPrefix:
      "Every file in this SRJ package is associated to the uniquee SRJ-access-key",
  },

  // File preview grid
  filePreviewGrid: {
    eyebrow: "Package files",
    lockedTitle: "Locked previews",
    unlockedTitle: "Unlocked previews",
    itemsSuffix: "items",
    pdfBadge: "PDF",
    previewUnavailable: "Preview unavailable in persisted demo state",
    unknownType: "Unknown type",
    termsGate: {
      eyebrow: "Access gate",
      title: "Accept terms and conditions to unlock file access",
      body:
        "Metadata remains visible for review, but previews and file access stay restricted until the recipient submits a named acceptance record.",
    },
  },

  // Terms acceptance modal
  termsModal: {
    eyebrow: "Terms acceptance",
    title: "Unlock SRJ package access",
    closeButton: "Close",
    fields: {
      fullNameLabel: "Full name",
      fullNamePlaceholder: "Taylor Morgan",
      emailLabel: "Email",
      emailPlaceholder: "taylor@example.org",
    },
    acceptanceLabel:
      "I accept the SRJ-demo terms and conditions and this access is logged for academic research.",
    packagePrefix: "Package:",
    submitIdle: "Accept and unlock",
    submitLoading: "Recording acceptance...",
    errors: {
      unableToLog: "Unable to log terms acceptance",
      unableToLogFallback: "Unable to log acceptance",
    },
  },

  // Platform access screen
  platformAccess: {
    header: {
      eyebrow: "Platform access authentication",
      title: "Secure Relational Jump(SRJ) Demo",
      description:
        "Review the terms and conditions below, complete three small steps to access this session.",
      termsEyebrow: "Terms and conditions",
      acceptLabel:
        "I accept the terms and understand that access to SRJ demo is provided through a unique SRJ-access-key.",
      logoutButton: "Logout session",
    },
    terms: [
      "This SRJ demo is intended only for authorized users to upload and compress digital files and multimedia assets",
      "Do not upload any illegal,unauthorized, or copyright materials into this SRJ prototype environment.",
      "Your SRJ-access-key is part of the demonstration experience and should be treated as a temporary access credential.",
      "Proceed only if you understand that your use and interactions with this website is for an academic research demonstration.",
    ],
    stages: {
      stageOneTitle: "Secure-key 1",
      stageOneHelper: "Solve the arithmetic expression to open the next verification step.",
      stageOnePlaceholder: "Enter the numeric result",
      stageTwoTitle: "Secure-key 2",
      stageTwoHelper:
        "Type yes or no to confirm whether the two arithmetic expressions are equivalent.",
      stageTwoPlaceholder: "Enter yes or no",
      stageThreeTitle: "Secure-key 3",
      stageThreeHelper:
        "Enter an arithmetic expression that is equivalent to the expression provided. Examples: 10-2, 7+1, 4*2.",
      stageThreePlaceholder: "Enter an equivalent arithmetic expression",
      accessGrantedTitle: "Access granted",
      buildKeyTitle: "Build your access key",
      unlockedTitle: "Access unlocked",
      stepPrefix: "Step",
      stepJoiner: "of",
      promptLabel: "Prompt",
      responseLabel: "Secure-key response",
      keySequenceLabel: "Current key sequence",
      keySequenceEmpty:
        "Your SRJ-key will be formed as you complete the three steps.",
      continueButton: "Continue to next secure-key",
      unlockButton: "Unlock platform access",
    },
    completion: {
      keyEyebrow: "Secure-relational-jump-access-key",
      keyBody:
        "Take note of this unique artihmetic combination. It is your SRJ-access-key for the current session.",
      statusEyebrow: "Session unlocked",
      statusBody:
        "Platform terms accepted and access authentication completed successfully.",
      downloadButton: "Download SRJ-access-key (.txt)",
      enterButton: "Enter SRJ Demo",
    },
    errors: {
      acceptTerms: "You must accept the platform terms before continuing.",
      emptyResponse: "Enter a response to continue.",
      wrongArithmetic: "That arithmetic result is not correct. Try again.",
      yesNoRequired: 'Enter "yes" or "no" for the equivalence check.',
      wrongVerification:
        "That verification result is incorrect. Re-evaluate the equation and try again.",
      invalidExpression: "Enter a valid arithmetic expression using numbers and operators.",
      wrongEquivalentRelation:
        "That expression is not equivalent to the airthmetic equation provided. Try another relation.",
    },
  },
} as const;

export const demoCopy = {
  // App metadata and global chrome
  app: {
    title: "SRJ",
    description: "Creating SRJ packages.",
    nav: {
      eyebrow: "Secure Relational Jump (SRJ)",
      title: "Data soverignity-in-progess",
      links: {
        overview: "Overview",
        create: "Create SRJ",
        open: "Unlock SRJ",
        retrieve: "View SRJ",
        logout: "Logout",
      },
    },
  },

  // Home page
  home: {
    hero: {
      eyebrow: "SRJ Demonstration",
      title: "Welcome",
      description:
        "SRJ uses two types of SRJ keys. One for data owners and custodians, who assemble files in an SRJ package using their SRJ-root key. Data recipients can access files using an SRJ-access key.",
    },
    flows: {
      create: {
        label: "Data Stewards",
        title: "Create Package",
        description:
          "Upload files, define access terms and conditions, notices, and generate SRJ-access keys for recipients.",
      },
      open: {
        label: "Data Recipients ",
        title: "Access Key",
        description:
          "Access files using SRJ-access keys, review metadata, and agree to terms and conditions of use.",
      },
      retrieve: {
        label: "Data Custodians",
        title: "Root Key",
        description:
          "Fetch SRJ package access history using your SRJ-root key. Delete your data using your SRJ-root key.",
      },
    },
    launchFlowLabel: "Get Started",
    highlights: {
      eyebrow: "Highlights",
      items: [
        "SRJ combines multimedia files and documents into one governed file package.",
        "SRJ ensures future access, sharing and reuse records are linked to SRJ-root keys.",
        "Recipients use an SRJ-access key, accept terms and conditions of use, before unlocking access to files inside an SRJ package.",
      ],
    },
    narrative: {
      eyebrow: "Capabilites",
      items: [
        "SRJ packages embed data goverance protocols in file manifests.",
        "SRJ packages generates a file manifest with package ID, access timestamps, and terms and conditions of use.",
        "Recipients unlocks the SRJ package, accepts terms and conditions, and receives copies of original files, embedded with data governace protocols.",
      ],
    },
  },

  // Create page
  createPage: {
    hero: {
      eyebrow: "Data Stewards",
      title: "Create SRJ",
      description:
        "Upload files and assemble an SRJ package, apply the terms and conditions of use, and generate SRJ-access keys that unlock access for recipients.",
    },
  },

  // Open page
  openPage: {
    hero: {
      eyebrow: "Data Recipients",
      title: "Unlock Files",
      description:
        "This recipient view shows file metadata, while placing file access restricted until and unless the recipient agreeing to terms and conditions of SRJ package.",
    },
  },

  // Retrieve page
  retrievePage: {
    hero: {
      eyebrow: "Data Custodians",
      title: "View SRJ Records",
      description:
        "Use an SRJ-access key to search for a shared package, or use your SRJ-root key to manage SRJ packages you created.",
    },
  },

  // Create flow form
  createForm: {
    eyebrow: "Create SRJ workflow",
    title: "Assemble files",
    storageBadge: "SRJ package",
    fields: {
      packageTitleLabel: "Package title",
      packageTitlePlaceholder: "Enter a package title",
      termsPresetLabel: "Terms and conditions of use",
      termsPresetPlaceholder: "Public research, education, and non-commercial use only.",
      noticeTextLabel: "Add Notice Text",
      noticeTextPlaceholder:
        "Data Governance notice: Access is granted for the accepted use case only. Redistribution, commercial reuse, and downstream rights expansion require a separate review.",
      rootKeyLabel: "SRJ-root key",
      rootKeyFallback: "Unlock the platform to generate an SRJ-root key",
      rootKeyHelp:
        "This SRJ-root key remains private and is used to fetch access records for the package owner.",
      packageAccessKeyLabel: "SRJ-access key",
      packageAccessKeyPlaceholder: "Create an SRJ-access key for this package",
      packageAccessKeyHelp:
        "You can create an SRJ-access key that unlocks access for recipients of SRJ packages.",
    },
    defaultTitle: "Test Packet",
    defaultTermsPreset: "Public research, education, and non-commercial use only.",
    defaultNoticeText:
      "Data Governance notice: Access is granted for the accepted use case only. Redistribution, commercial reuse, and downstream rights expansion require a separate review.",
    defaultPackageAccessKey: "A2",
    submitIdle: "Generate SRJ package",
    submitLoading: "Uploading to SRJ demo website...",
    uploadSummaryPrefix:
      "",
    uploadSummarySuffix: ".",
    successTitlePrefix: "Package created:",
    successBody:
      "The SRJ package is now available, along with the file manifests.",
    successLink: "Continue to unlock SRJ →",
    viewManifestButton: "View Manifest",
    closeManifestButton: "Close Manifest",
    errors: {
      totalUploadLimit: "Total upload size must stay within 4 MB.",
      invalidRelation: "Enter a non-empty package SRJ-access key.",
      unableToCreate: "Unable to create the SRJ package.",
    },
  },

  // File upload block
  fileDropzone: {
    dropTitle: "Click here to upload files and create SRJ package",
    dropDescription:
      "Upload multiple images, short audio/video clips, and text documents (.pdf, .txt).",
    limitBadge: "4 MB total file size limit",
    selectButton: "Select files",
    allowedPrefix: "Files selected:",
    totalSelectedPrefix: "Total selected:",
    unknownType: "Unknown type",
    removeButton: "Remove",
    allowedLabel:
      "",
    errors: {
      invalidType:
        "Only images, short audio clips, short video clips, PDFs, and TXT files are allowed.",
      totalUploadLimit: "Total upload size must stay within 4 MB.",
    },
  },

  // Manifest preview panel
  manifestPreview: {
    eyebrow: "Preview",
    title: "File Manifest",
    badge: "Real Time",
    emptyState: "{\n  // create a package to preview the manifest\n}",
  },

  // Open flow
  openExperience: {
    emptyState: {
      eyebrow: "Unlock flow",
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
      title: "Load another SRJ package",
      placeholderTop: 'Paste a package manifest JSON here to simulate "Unlock SRJ"',
      placeholderBottom: "Paste a manifest to simulate unlocking a shared SRJ package",
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
      body: "Unlock SRJ shows the package matched to an SRJ-access key.",
    },
    recipientStatus: {
      eyebrow: "Recipient status",
      unlockedTitle: "Access unlocked",
      lockedTitle: "Awaiting acceptance",
      lockedBody:
        "Metadata is visible now. File previews and data remain hidden until SRJ is unlocked.",
      acceptedByPrefix: "Accepted by",
      acceptedOnJoiner: "on",
    },
    governanceNotice: {
      eyebrow: "Data Governance notice",
      body:
        "Data Governance notice: Access is granted for the accepted use case only. Redistribution, commercial reuse, and downstream rights expansion require a separate review.",
    },
    actions: {
      reviewTerms: "Unlock SRJ Package",
      downloadZipStructured: "Download files in ZIP",
      downloadZipEmbedded: "Download embedded files in ZIP",
      downloadZipStructuredHint:
        "Keeps the files paired to a manifest in individual folders.",
      downloadZipEmbeddedHint:
        "Keeps the files together in a single folder.",
      addMetadataLayer: "Add metadata layer",
      addMetadataLayerHint:
        "Add translations, annotations, summaries, etc.",
    },
    metadataLayers: {
      eyebrow: "Metadata layers",
      title: "Contribution layers",
      emptyState:
        "No metadata layers have been added to this package yet.",
      linkedFilesPrefix: "Linked files",
      addedByPrefix: "Added by",
      typePrefix: "Layer type",
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
      eyebrow: "Package access",
      title: "Unlock an SRJ package",
      body:
        "Enter the SRJ-access key to search for matching SRJ package records. SRJ packages remain hidden until a matching key is provided.",
      keyLabel: "SRJ-access key",
      keyPlaceholder: "Enter the SRJ-access key shared with you",
      retrieveButton: "Search packages",
      retrievingButton: "Searching packages...",
      emptyResults: "No SRJ packages matched that SRJ-access key.",
      resultsTitle: "Matching SRJ packages",
      openButton: "Unlock package",
      deleteButton: "Delete package",
      packageIdLabel: "Package ID",
      keyIdLabel: "SRJ key ID",
      deletePanelTitle: "Delete this package",
      deletePanelBody:
        "To delete a package, confirm the package ID and the same SRJ-access key used when it was created.",
      confirmDeleteButton: "Confirm delete",
      deletingButton: "Deleting package...",
    },
    errors: {
      missingKey: "Enter an SRJ-access key to search SRJ packages.",
      incorrectKey: "The SRJ-access key is incorrect.",
      deleteFallback: "Unable to delete the SRJ package.",
    },
    ownerFlow: {
      eyebrow: "SRJ-root key access",
      title: "View SRJ records",
      body:
        "Use your SRJ-root key to view or delete packages you created. This option also allows package owners to delete their data.",
      rootKeyLabel: "Current SRJ-root key",
      rootKeyFallback: "Unlock the platform to generate an SRJ-root key",
      loadButton: "Load my packages",
      loadingButton: "Loading my packages...",
      openButton: "Unlock package",
      deleteButton: "Delete package",
      downloadRecordsButton: "Download access-records",
      emptyState: "No packages are linked to your current SRJ-root key.",
    },
  },

  // Metadata card in unlock flow
  packageMetadata: {
    eyebrow: "SRJ Package metadata",
    labels: {
      createdAt: "Created at",
      termsVersion: "Terms version",
      fileCount: "File count",
      totalPackageSize: "Total package size",
      allowedUses: "Allowed uses",
      noticeText: "Notice text",
      srjKeyReference: "Package SRJ-access key",
      keyId: "Access key ID",
      relation: "SRJ-access key",
      targetValue: "Target value",
    },
    targetValueFallback: "Non-native access key",
    assetCountSuffix: "assets",
    srjKeyReferenceBodyPrefix:
      "Every file in this SRJ package is associated to the package SRJ-access key",
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
    ownerSession: {
      eyebrow: "Current session key",
      body:
        "This package matches your active SRJ-root key session. You can skip entering your details and still have the access recorded.",
      skipButton: "Skip details and unlock",
      fallbackName: "SRJ-root key session holder",
      fallbackEmail: "root-key-session@srj.local",
      fallbackOrganization: "Not provided",
    },
    fields: {
      fullNameLabel: "Full name",
      fullNamePlaceholder: "Lorem Epsum",
      emailLabel: "Email",
      emailPlaceholder: "LoremEpsum@example.org",
      organizationLabel: "Organization",
      organizationPlaceholder: "University, lab, collective, or community",
    },
    acceptanceLabel:
      "I accept the terms and conditions for this SRJ package and understand that this access record is logged for academic research.",
    packagePrefix: "Package:",
    submitIdle: "Accept and unlock",
    submitLoading: "Recording acceptance...",
    errors: {
      acceptRequired: "Accept the terms and conditions to unlock this package.",
      unableToLog: "Unable to log terms acceptance",
      unableToLogFallback: "Unable to log acceptance",
    },
  },

  metadataLayerForm: {
    hero: {
      eyebrow: "Contribution layer",
      title: "Add metadata layer",
      description:
        "Attach a structured metadata layer to files in this SRJ package without changing the original source package.",
    },
    progressTitle: "Phase 1.1 in progress",
    progressBody:
      "This contribution workflow is live for local testing and keeps the original package intact while layering new metadata on top.",
    progressBodyTwo:
      "Some file-linking and append behaviors are intentionally held for Phase 2 so the current demo stays lightweight and stable.",
    packageContextEyebrow: "Package context",
    contributorEyebrow: "Contributor session",
    contributorFallbackName: "Current SRJ session",
    contributorFallbackEmail: "No email linked",
    contributorFallbackOrganization: "No organization linked",
    fileSelectorLabel: "Select file(s)",
    layerTypeLabel: "Layer type",
    titleLabel: "Layer title",
    titlePlaceholder: "Enter a short title for this layer",
    languageLabel: "Language",
    languagePlaceholder: "en, es, fr, etc.",
    descriptionLabel: "Description",
    descriptionPlaceholder:
      "Describe what this metadata layer adds to the selected files.",
    notesLabel: "Notes",
    notesPlaceholder: "Optional notes for this contribution layer.",
    translationLanguageLabel: "Target language",
    translationLanguagePlaceholder: "Enter the translated language",
    translationScopeLabel: "Translation scope",
    translationScopePlaceholder: "Captions, full document, selected passages, etc.",
    annotationTextLabel: "Annotation text",
    regionReferenceLabel: "File region reference",
    regionReferencePlaceholder: "Page, timestamp, figure, or section",
    summaryTextLabel: "Summary text",
    intendedAudienceLabel: "Intended audience",
    intendedAudiencePlaceholder: "Researchers, students, community members, etc.",
    rightsNoteLabel: "Rights note",
    rightsScopeLabel: "Rights scope",
    rightsScopePlaceholder: "Package-wide, selected file, excerpt, etc.",
    contextTextLabel: "Context note",
    sensitivityNoteLabel: "Cultural sensitivity note",
    handlingGuidanceLabel: "Handling guidance",
    teachingContextLabel: "Educational note",
    transcriptionTextLabel: "Transcription text",
    customTypeLabel: "Custom type label",
    customTypePlaceholder: "Enter a short custom label",
    customContentLabel: "Custom content",
    sourceLinkTitle: "Source link and upload",
    sourceLinkButton: "Upload or link source file",
    sourceLinkStatus: "Under development",
    sourceLinkBody:
      "Phase 2 will support linking an existing file in this package, or uploading and appending a new file into the package.",
    saveButton: "Save metadata layer",
    savingButton: "Saving metadata layer...",
    backLink: "Back to package",
    successTitle: "Metadata layer saved",
    successBody:
      "The contribution layer has been added to this package and linked to the session record.",
    errors: {
      packageUnavailable: "This SRJ package is not currently available in the local session.",
      sessionRequired: "Unlock a package in the current session before adding metadata layers.",
      fileRequired: "Select at least one package file.",
      layerTypeRequired: "Select a metadata layer type.",
      titleRequired: "Enter a metadata layer title.",
      descriptionRequired: "Enter a metadata layer description.",
      saveFailed: "Unable to save the metadata layer.",
    },
    layerTypeOptions: {
      translation: "Translation",
      annotation: "Annotation",
      summary: "Summary",
      contextNote: "Context note",
      rightsNote: "Rights note",
      culturalSensitivityNote: "Cultural sensitivity note",
      educationalNote: "Educational note",
      transcription: "Transcription",
      other: "Other",
    },
  },

  // Platform access screen
  platformAccess: {
    header: {
      eyebrow: "Access Terms and Conditions",
      title: "Secure Relational Jump (.SRJ)",
      subtitle: "Data as a Relation",
      description:
        "Review the terms and conditions above to access this session.",
      termsEyebrow: "Terms and conditions",
      lastUpdatedLabel: "Last Updated: April 16, 2026",
      acceptLabel:
        "I am 21 years old and above. I accept the terms and conditions for using this website.",
      logoutButton: "Logout session",
      invitationTitle: "Already have a previous key?",
      invitationTypeSecure: "SRJ-root key",
      invitationTypeAccess: "SRJ-access key",
      invitationScreenTitle: "Access a previous key",
      invitationScreenBody:
        "Use an SRJ-root key or SRJ-access key to return to previously linked SRJ packages.",
      invitationLabel: "Key value",
      secureKeyPlaceholder: "Enter your SRJ-root key",
      accessKeyPlaceholder: "Enter your SRJ-access key",
      secureKeyButton: "Access with SRJ-root key",
      accessKeyButton: "Access with SRJ-access key",
      invitationLoadingButton: "Checking key...",
      invitationBackButton: "Go back",
    },
    notice: {
      intro:
        "This SRJ website is currently a work in progress. Institutional Review Board (IRB) application and approval for this study are currently in progress, and formal participant enrollment has not yet begun. If you received access from the site administrator and agree to the terms and conditions below, you may use this site for academic review, testing, and evaluation only. All data collected during this pilot period will be deleted by the site administrator and will not be part of the research study.",
      uploadBullets: [
        "You may upload images, short-form audio or video, PDF files, and TXT documents to create an \"SRJ package.\" The maximum storage limit is 4 MB per session.",
        "You may create your own \"SRJ-access keys\" and add new metadata layers to package files that support them.",
        "Do not upload illegal, unauthorized, confidential, or copyright-protected material without permission.",
        "Do not impersonate another person or use an email address that does not belong to you.",
        "You may use fictional names or email addresses, such as abc@example.org, to protect your privacy.",
      ],
      body: [
        "Institutional Review Board (IRB) application and approval for this study are currently in progress, and formal participant enrollment has not yet begun. If you received access from the site administrator and agree to the terms and conditions below, you may use this site for academic review, testing, and evaluation only. All data collected during this pilot period will be deleted by the site administrator and will not be part of the research study.",
        "Formal participant enrollment is expected to begin on June 15, 2026. To request a formal invitation or share feedback, please email the site administrator, Turam Purty, at turamp@washington.edu.",
        "This website is part of a research project titled \"Data Sovereignty in the Age of Gen-AI\" at the University of Washington, Seattle. The goal is to evaluate technical solutions that can protect digital assets, such as e-publications and online datasets, from unsupervised access, misuse, misrepresentation, and misappropriation.",
        "This research experience is intended for Indigenous and non-Native scholars who are interested in publishing their data through websites, mobile applications, and AI tools while protecting it from unsupervised access, reuse, and sharing.",
        "Your interactions with this website are recorded and contribute to a doctoral dissertation project. Access requires creating an SRJ-root key that is space-sensitive and may include special characters. This key is required to create, access, and delete your data.",
        "The site administrator has access to your uploaded data according to the terms and conditions you declare. Personal details, including names, email addresses, and organizations, will be removed before any public presentation, research paper, or dataset resulting from this project. Your personal data is accessible only to the site administrator for the duration of the project and is never shared with external individuals or organizations. You may delete your research data at any time by using your SRJ-root key or by emailing the site administrator with reliable information about your data.",
        "Research data on this website is archived at regular intervals. Publications resulting from this work will be made available to participants who sign up for a 30-45 minute online interview with the site administrator. Interview participants may opt in to reimbursement for their time and, after completing the interview, will receive a gift card via email redeemable at a variety of online stores. The specific details of the online interview and reimbursement will be provided to participants once they are contacted by the site administrator.",
        "You must be at least 21 years old to use this website. This website, including its data processing and storage capacity, is provided as is and for academic research purposes only. The site administrator and affiliated parties, including the University of Washington, are not liable for any loss, damage, injury, data exposure, or technical failure arising from your use of this website.",
      ],
      acknowledgement:
        "By agreeing below, you acknowledge that you understand this notice and agree to the terms and conditions attached to this website.",
      contactEmail: "turamp@washington.edu",
    },
    terms: [
      "This SRJ website is currently a work in progress. Institutional Review Board (IRB) application and approval for this study are currently in progress, and formal participant enrollment has not yet begun. If you received access from the site administrator and agree to the terms and conditions below, you may use this site for academic review, testing, and evaluation only. All data collected during this pilot period will be deleted by the site administrator and will not be part of the research study.",
      "Formal participant enrollment is expected to begin on June 15, 2026. To request a formal invitation or share feedback, please email the site administrator, Turam Purty, at turamp@washington.edu.",
      "This website is part of a research project titled \"Data Sovereignty in the Age of Gen-AI\" at the University of Washington, Seattle. The goal is to evaluate technical solutions that can protect digital assets, such as e-publications and online datasets, from unsupervised access, misuse, misrepresentation, and misappropriation.",
      "This research experience is intended for Indigenous and non-Native scholars who are interested in publishing their data through websites, mobile applications, and AI tools while protecting it from unsupervised access, reuse, and sharing.",
      "Your interactions with this website are recorded and contribute to a doctoral dissertation project. Access requires creating an SRJ-root key that is space-sensitive and may include special characters. This key is required to create, access, and delete your data.",
      "You may upload images, short-form audio or video, PDF files, and TXT documents to create an \"SRJ package.\" The maximum storage limit is 4 MB per session. You may create your own \"SRJ-access keys\" and add new metadata layers to package files that support them. Do not upload illegal, unauthorized, confidential, or copyright-protected material without permission. Do not impersonate another person or use an email address that does not belong to you. You may use fictional names or email addresses, such as abc@example.org, to protect your privacy.",
      "The site administrator has access to your uploaded data according to the terms and conditions you declare. Personal details, including names, email addresses, and organizations, will be removed before any public presentation, research paper, or dataset resulting from this project. Your personal data is accessible only to the site administrator for the duration of the project and is never shared with external individuals or organizations. You may delete your research data at any time by using your SRJ-root key or by emailing the site administrator with reliable information about your data.",
      "Research data on this website is archived at regular intervals. Publications resulting from this work will be made available to participants who sign up for a 30-45 minute online interview with the site administrator. Interview participants may opt in to reimbursement for their time and, after completing the interview, will receive a gift card via email redeemable at a variety of online stores. The specific details of the online interview and reimbursement will be provided to participants once they are contacted by the site administrator.",
      "You must be at least 21 years old to use this website. This website, including its data processing and storage capacity, is provided as is and for academic research purposes only. The site administrator and affiliated parties, including the University of Washington, are not liable for any loss, damage, injury, data exposure, or technical failure arising from your use of this website.",
      "By agreeing below, you acknowledge that you understand this notice and agree to the terms and conditions attached to this website.",
    ],
    stages: {
      stageOneTitle: "SRJ-root key 1",
      stageOneHelper: "Solve this arithmetic expression to unlock the next verification step.",
      stageOnePlaceholder: "Enter the numeric result",
      stageTwoTitle: "SRJ-root key 2",
      stageTwoHelper:
        "Type yes or no to confirm whether the two arithmetic expressions are equivalent.",
      stageTwoPlaceholder: "Enter yes or no",
      stageThreeTitle: "SRJ-root key 3",
      stageThreeHelper:
        "Enter an arithmetic expression that is equivalent to the expression provided. Examples: 10-2, 7+1, 4*2.",
      stageThreePlaceholder: "Enter an equivalent arithmetic expression",
      accessGrantedTitle: "Access granted",
      buildKeyTitle: "Build your SRJ-root key",
      unlockedTitle: "Access unlocked",
      stepPrefix: "Step",
      stepJoiner: "of",
      promptLabel: "Relation",
      responseLabel: "SRJ-root key response",
      responseHelp: "Enter an accurate numeric response.",
      stageTwoResponseHelp: "Enter yes or no.",
      stageThreeResponseHelp: "Enter an equivalent arithmetic response.",
      keySequenceLabel: "Current key sequence",
      keySequenceEmpty:
        "Your SRJ-key will be formed as you complete the three steps.",
      continueButton: "Continue to next SRJ-root key",
      unlockButton: "Unlock platform access",
    },
    completion: {
      keyEyebrow: "Secure relational jump root key",
      keyBody:
        "Take note of this unique artihmetic combination. It is your SRJ-root key for the current session.",
      nextTitle: "Next stop",
      nextBody:
        "You can download your secure key now, then decide whether to link your contact details on the next screen.",
      linkTitle: "Link this SRJ-root key to your identity",
      optionalLabel: "Optional:",
      linkBody:
        "link your name, email, and organization to this secure key. The site administrator may follow up once per quarter with research updates, or you can skip it and evaluate anonymously. You can always link it the second time.",
      nameLabel: "Full name",
      namePlaceholder: "Enter your full name",
      organizationLabel: "Organization",
      organizationPlaceholder: "University, lab, collective, or community",
      emailLabel: "Email address",
      emailPlaceholder: "name@example.org",
      statusEyebrow: "Session unlocked",
      statusBody:
        "Platform terms accepted and access authentication completed successfully.",
      downloadButton: "Download SRJ-root key (.txt)",
      continueButton: "Continue",
      backButton: "Back to secure key",
      skipButton: "Skip and enter anonymously",
      enterButton: "Enter SRJ Website",
    },
    invitationResult: {
      eyebrow: "Invitation access",
      title: "Packages linked to this SRJ-root key",
      ownerFallback: "Unlinked root-key owner",
      emailFallback: "No linked email yet",
      organizationFallback: "No linked organization yet",
      noPackages: "No SRJ packages are currently linked to this SRJ-root key.",
      noAccessKeyPackages: "No SRJ packages are currently linked to this SRJ-access key.",
      enterButton: "Enter SRJ Demo",
      openButton: "Unlock package",
      deleteButton: "Delete package",
      downloadRecordsButton: "Download access-records",
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
      invitationCodeRequired: "Enter a key to continue.",
      invitationCodeInvalid: "That SRJ-root key could not be found.",
      accessKeyInvalid: "That SRJ-access key could not be found.",
      ownerActionFailed: "Unable to complete the requested owner action.",
    },
  },
} as const;

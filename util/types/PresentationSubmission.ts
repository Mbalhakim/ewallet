// https://identity.foundation/presentation-exchange/#presentation-submission
export interface PresentationSubmission {
  id: string;
  definition_id: string;
  descriptor_map: InputDescriptorMap[];
}

export interface InputDescriptorMap {
  id: string;
  format: string;
  path: string;
  path_nested?: InputDescriptorMap;
}

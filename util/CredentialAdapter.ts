import log from './ReactLogger';

/**
 * Interface representing a standardized credential structure
 */
export interface StandardizedCredential {
  id: string;
  type: string;
  issuer: string | object;
  issuanceDate: string;
  expirationDate?: string;
  subject: any;
  name?: string;
  description?: string | object;
  rawCredential: any;
}

/**
 * Adapter for transforming different verifiable credential formats
 * into a consistent structure
 */
export class CredentialAdapter {
  /**
   * Throws an error if credential is missing
   */
  private static assertCredentialExists(credential: any): void {
    if (!credential) {
      throw new Error('Credential is vereist voor deze operatie.');
    }
  }

  /**
   * Standardizes any credential format into a consistent structure
   */
  static standardizeCredential(credential: any): StandardizedCredential {
    this.assertCredentialExists(credential);
    // Default structure with fallback values
    const result: StandardizedCredential = {
      id: 'Onbekende ID',
      name: 'Onbekende Naam',
      type: 'Onbekende Type',
      issuer: 'Onbekende Issuer',
      issuanceDate: new Date().toISOString(),
      subject: {},
      rawCredential: credential
    };

    try {
      // Process as wrapped credential (all credentials follow this pattern)
      const key = Object.keys(credential)[0];
      const innerCred = key ? credential[key] : credential;

      if (!innerCred) return result;

      // Process the inner credential
      // Er is geen garantie dat innerCred.id of key aanwezig is.
      // Als beide ontbreken, blijft 'Onbekende ID' als id staan.
      result.id = innerCred.id || key || result.id;

      // Extract type with extended format support
      const typeInfo = this.extractExtendedTypeInfo(innerCred);
      result.type = typeInfo || result.type;

      // Extract issuer with fallback to alternative property names
      result.issuer = innerCred.issuer || innerCred.iss || result.issuer;

      // Extract metadata
      result.name = innerCred.name || result.name;
      result.description = innerCred.description || result.description;

      // Extract issuance date with extended format support
      result.issuanceDate =
        this.extractExtendedIssuanceDate(innerCred) || result.issuanceDate;

      // Extract expiration date if available
      result.expirationDate = this.extractExpirationDate(innerCred);

      // Extract subject with support for different formats
      result.subject =
        this.extractCredentialSubject(innerCred) || result.subject;

      // Returns fully populated result after successful processing
      return result;
    } catch (error) {
      log.debug('Fout bij standaardiseren van credential:', error);
    }
    // Returns partially populated result
    return result;
  }

  /**
   * Extracts the credential type with extended format support
   */
  private static extractExtendedTypeInfo(credential: any): string | undefined {
    // Standard schema ID
    if (credential.credentialSchema?.id) {
      return credential.credentialSchema.id;
    }

    // W3C Verifiable Credential format
    // deze check haalt alleen het type op, niet of het object een volledige W3C VC is.

    if (credential.vc?.type && Array.isArray(credential.vc.type)) {
      return credential.vc.type.length > 1
        ? credential.vc.type[1]
        : credential.vc.type[0];
    }

    // Direct type property
    if (credential.type) {
      return Array.isArray(credential.type)
        ? credential.type.length > 1
          ? credential.type[1]
          : credential.type[0]
        : credential.type;
    }

    // Fall back to name
    if (credential.name) {
      return credential.name;
    }

    // Geen type of naam gevonden
    return 'Onbekend type';
  }

  /**
   * Extracts issuance date with extended format support
   */
  private static extractExtendedIssuanceDate(
    credential: any
  ): string | undefined {
    // Check for common issuance date formats
    if (credential.issuanceDate) return credential.issuanceDate;
    if (credential.issued) return credential.issued;
    if (credential.proof?.created) return credential.proof.created;
    if (credential.nbf) return new Date(credential.nbf * 1000).toISOString();

    return 'Onbekend issuance datum';
  }

  /**
   * Extracts expiration date if available
   */
  private static extractExpirationDate(credential: any): string | undefined {
    if (credential.expirationDate) return credential.expirationDate;
    if (credential.exp) return new Date(credential.exp * 1000).toISOString();

    return 'Onbekende expiration datum';
  }

  /**
   * Extracts credential subject with support for different formats
   */
  private static extractCredentialSubject(credential: any): any | undefined {
    if (credential.credentialSubject) return credential.credentialSubject;
    if (credential.vc?.credentialSubject)
      return credential.vc.credentialSubject;
    if (credential.subject) return credential.subject;

    return undefined;
  }

  /**
   * Get the credential type in a standardized way
   */
  static getType(credential: any): string {
    return this.standardizeCredential(credential).type;
  }

  /**
   * Get the issuance date in a standardized way
   */
  static getIssuanceDate(credential: any): string {
    return this.standardizeCredential(credential).issuanceDate;
  }

  /**
   * Get the expiration date in a standardized way
   */
  static getExpirationDate(credential: any): string | undefined {
    return this.standardizeCredential(credential).expirationDate;
  }

  /**
   * Get credential name if available
   */
  static getName(credential: any): string | undefined {
    return this.standardizeCredential(credential).name;
  }

  /**
   * Get the credential issuer in a standardized way
   * Handles cases where issuer can be a string or object
   */
  static getIssuer(credential: any): string {
    const issuer = this.standardizeCredential(credential).issuer;

    if (typeof issuer === 'string') {
      return issuer;
    } else if (typeof issuer === 'object' && issuer !== null) {
      // For object issuers (common in some formats), return the name or id if available
      return issuer.name || issuer.id || JSON.stringify(issuer);
    }

    return 'Onbekende Issuer';
  }

  /**
   * Format a date string to a readable format
   */
  static formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (error) {
      return dateString;
    }
  }

  /**
   * Legacy method name for backward compatibility
   */
  static normalize(credential: any): StandardizedCredential {
    return this.standardizeCredential(credential);
  }
}

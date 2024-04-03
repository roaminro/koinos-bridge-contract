import { Writer, Reader } from "as-proto";

export namespace bridge {
  export class repeated_addresses {
    static encode(message: repeated_addresses, writer: Writer): void {
      const unique_name_addresses = message.addresses;
      if (unique_name_addresses.length !== 0) {
        for (let i = 0; i < unique_name_addresses.length; ++i) {
          writer.uint32(10);
          writer.bytes(unique_name_addresses[i]);
        }
      }
    }

    static decode(reader: Reader, length: i32): repeated_addresses {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new repeated_addresses();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.addresses.push(reader.bytes());
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    addresses: Array<Uint8Array>;

    constructor(addresses: Array<Uint8Array> = []) {
      this.addresses = addresses;
    }
  }

  export class metadata_object {
    static encode(message: metadata_object, writer: Writer): void {
      if (message.initialized != false) {
        writer.uint32(8);
        writer.bool(message.initialized);
      }

      if (message.nonce != 0) {
        writer.uint32(16);
        writer.uint64(message.nonce);
      }

      if (message.chain_id != 0) {
        writer.uint32(24);
        writer.uint32(message.chain_id);
      }

      if (message.nb_validators != 0) {
        writer.uint32(32);
        writer.uint32(message.nb_validators);
      }

      if (message.fee_amount != 0) {
        writer.uint32(40);
        writer.uint64(message.fee_amount);
      }

      if (message.fee_to.length != 0) {
        writer.uint32(50);
        writer.bytes(message.fee_to);
      }
    }

    static decode(reader: Reader, length: i32): metadata_object {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new metadata_object();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.initialized = reader.bool();
            break;

          case 2:
            message.nonce = reader.uint64();
            break;

          case 3:
            message.chain_id = reader.uint32();
            break;

          case 4:
            message.nb_validators = reader.uint32();
            break;

          case 5:
            message.fee_amount = reader.uint64();
            break;

          case 6:
            message.fee_to = reader.bytes();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    initialized: bool;
    nonce: u64;
    chain_id: u32;
    nb_validators: u32;
    fee_amount: u64;
    fee_to: Uint8Array;

    constructor(
      initialized: bool = false,
      nonce: u64 = 0,
      chain_id: u32 = 0,
      nb_validators: u32 = 0,
      fee_amount: u64 = 0,
      fee_to: Uint8Array = new Uint8Array(0)
    ) {
      this.initialized = initialized;
      this.nonce = nonce;
      this.chain_id = chain_id;
      this.nb_validators = nb_validators;
      this.fee_amount = fee_amount;
      this.fee_to = fee_to;
    }
  }

  @unmanaged
  export class empty_object {
    static encode(message: empty_object, writer: Writer): void {}

    static decode(reader: Reader, length: i32): empty_object {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new empty_object();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    constructor() {}
  }

  @unmanaged
  export class boole {
    static encode(message: boole, writer: Writer): void {
      if (message.value != false) {
        writer.uint32(8);
        writer.bool(message.value);
      }
    }

    static decode(reader: Reader, length: i32): boole {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new boole();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.value = reader.bool();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    value: bool;

    constructor(value: bool = false) {
      this.value = value;
    }
  }

  export class initialize_arguments {
    static encode(message: initialize_arguments, writer: Writer): void {
      if (message.chain_id != 0) {
        writer.uint32(8);
        writer.uint32(message.chain_id);
      }

      const unique_name_initial_validators = message.initial_validators;
      if (unique_name_initial_validators.length !== 0) {
        for (let i = 0; i < unique_name_initial_validators.length; ++i) {
          writer.uint32(18);
          writer.bytes(unique_name_initial_validators[i]);
        }
      }
    }

    static decode(reader: Reader, length: i32): initialize_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new initialize_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.chain_id = reader.uint32();
            break;

          case 2:
            message.initial_validators.push(reader.bytes());
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    chain_id: u32;
    initial_validators: Array<Uint8Array>;

    constructor(chain_id: u32 = 0, initial_validators: Array<Uint8Array> = []) {
      this.chain_id = chain_id;
      this.initial_validators = initial_validators;
    }
  }

  export class get_validators_arguments {
    static encode(message: get_validators_arguments, writer: Writer): void {
      if (message.start.length != 0) {
        writer.uint32(10);
        writer.bytes(message.start);
      }

      if (message.limit != 0) {
        writer.uint32(16);
        writer.int32(message.limit);
      }

      if (message.descending != false) {
        writer.uint32(24);
        writer.bool(message.descending);
      }
    }

    static decode(reader: Reader, length: i32): get_validators_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new get_validators_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.start = reader.bytes();
            break;

          case 2:
            message.limit = reader.int32();
            break;

          case 3:
            message.descending = reader.bool();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    start: Uint8Array;
    limit: i32;
    descending: bool;

    constructor(
      start: Uint8Array = new Uint8Array(0),
      limit: i32 = 0,
      descending: bool = false
    ) {
      this.start = start;
      this.limit = limit;
      this.descending = descending;
    }
  }

  export class get_supported_tokens_arguments {
    static encode(
      message: get_supported_tokens_arguments,
      writer: Writer
    ): void {
      if (message.start.length != 0) {
        writer.uint32(10);
        writer.bytes(message.start);
      }

      if (message.limit != 0) {
        writer.uint32(16);
        writer.int32(message.limit);
      }

      if (message.descending != false) {
        writer.uint32(24);
        writer.bool(message.descending);
      }
    }

    static decode(reader: Reader, length: i32): get_supported_tokens_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new get_supported_tokens_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.start = reader.bytes();
            break;

          case 2:
            message.limit = reader.int32();
            break;

          case 3:
            message.descending = reader.bool();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    start: Uint8Array;
    limit: i32;
    descending: bool;

    constructor(
      start: Uint8Array = new Uint8Array(0),
      limit: i32 = 0,
      descending: bool = false
    ) {
      this.start = start;
      this.limit = limit;
      this.descending = descending;
    }
  }

  export class get_supported_wrapped_tokens_arguments {
    static encode(
      message: get_supported_wrapped_tokens_arguments,
      writer: Writer
    ): void {
      if (message.start.length != 0) {
        writer.uint32(10);
        writer.bytes(message.start);
      }

      if (message.limit != 0) {
        writer.uint32(16);
        writer.int32(message.limit);
      }

      if (message.descending != false) {
        writer.uint32(24);
        writer.bool(message.descending);
      }
    }

    static decode(
      reader: Reader,
      length: i32
    ): get_supported_wrapped_tokens_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new get_supported_wrapped_tokens_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.start = reader.bytes();
            break;

          case 2:
            message.limit = reader.int32();
            break;

          case 3:
            message.descending = reader.bool();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    start: Uint8Array;
    limit: i32;
    descending: bool;

    constructor(
      start: Uint8Array = new Uint8Array(0),
      limit: i32 = 0,
      descending: bool = false
    ) {
      this.start = start;
      this.limit = limit;
      this.descending = descending;
    }
  }

  @unmanaged
  export class get_metadata_arguments {
    static encode(message: get_metadata_arguments, writer: Writer): void {}

    static decode(reader: Reader, length: i32): get_metadata_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new get_metadata_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    constructor() {}
  }

  export class set_pause_arguments {
    static encode(message: set_pause_arguments, writer: Writer): void {
      const unique_name_signatures = message.signatures;
      if (unique_name_signatures.length !== 0) {
        for (let i = 0; i < unique_name_signatures.length; ++i) {
          writer.uint32(10);
          writer.bytes(unique_name_signatures[i]);
        }
      }

      if (message.pause != false) {
        writer.uint32(16);
        writer.bool(message.pause);
      }

      if (message.expiration != 0) {
        writer.uint32(24);
        writer.uint64(message.expiration);
      }
    }

    static decode(reader: Reader, length: i32): set_pause_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new set_pause_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.signatures.push(reader.bytes());
            break;

          case 2:
            message.pause = reader.bool();
            break;

          case 3:
            message.expiration = reader.uint64();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    signatures: Array<Uint8Array>;
    pause: bool;
    expiration: u64;

    constructor(
      signatures: Array<Uint8Array> = [],
      pause: bool = false,
      expiration: u64 = 0
    ) {
      this.signatures = signatures;
      this.pause = pause;
      this.expiration = expiration;
    }
  }

  export class transfer_tokens_arguments {
    static encode(message: transfer_tokens_arguments, writer: Writer): void {
      if (message.from.length != 0) {
        writer.uint32(10);
        writer.bytes(message.from);
      }

      if (message.token.length != 0) {
        writer.uint32(18);
        writer.bytes(message.token);
      }

      if (message.amount != 0) {
        writer.uint32(24);
        writer.uint64(message.amount);
      }

      if (message.to_chain != 0) {
        writer.uint32(32);
        writer.uint32(message.to_chain);
      }

      if (message.recipient.length != 0) {
        writer.uint32(42);
        writer.string(message.recipient);
      }
    }

    static decode(reader: Reader, length: i32): transfer_tokens_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new transfer_tokens_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.from = reader.bytes();
            break;

          case 2:
            message.token = reader.bytes();
            break;

          case 3:
            message.amount = reader.uint64();
            break;

          case 4:
            message.to_chain = reader.uint32();
            break;

          case 5:
            message.recipient = reader.string();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    from: Uint8Array;
    token: Uint8Array;
    amount: u64;
    to_chain: u32;
    recipient: string;

    constructor(
      from: Uint8Array = new Uint8Array(0),
      token: Uint8Array = new Uint8Array(0),
      amount: u64 = 0,
      to_chain: u32 = 0,
      recipient: string = ""
    ) {
      this.from = from;
      this.token = token;
      this.amount = amount;
      this.to_chain = to_chain;
      this.recipient = recipient;
    }
  }

  export class complete_transfer_arguments {
    static encode(message: complete_transfer_arguments, writer: Writer): void {
      if (message.transaction_id.length != 0) {
        writer.uint32(10);
        writer.bytes(message.transaction_id);
      }

      if (message.token.length != 0) {
        writer.uint32(18);
        writer.bytes(message.token);
      }

      if (message.recipient.length != 0) {
        writer.uint32(26);
        writer.bytes(message.recipient);
      }

      if (message.value != 0) {
        writer.uint32(32);
        writer.uint64(message.value);
      }

      const unique_name_signatures = message.signatures;
      if (unique_name_signatures.length !== 0) {
        for (let i = 0; i < unique_name_signatures.length; ++i) {
          writer.uint32(50);
          writer.bytes(unique_name_signatures[i]);
        }
      }

      if (message.expiration != 0) {
        writer.uint32(56);
        writer.uint64(message.expiration);
      }
    }

    static decode(reader: Reader, length: i32): complete_transfer_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new complete_transfer_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.transaction_id = reader.bytes();
            break;

          case 2:
            message.token = reader.bytes();
            break;

          case 3:
            message.recipient = reader.bytes();
            break;

          case 4:
            message.value = reader.uint64();
            break;

          case 6:
            message.signatures.push(reader.bytes());
            break;

          case 7:
            message.expiration = reader.uint64();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    transaction_id: Uint8Array;
    token: Uint8Array;
    recipient: Uint8Array;
    value: u64;
    signatures: Array<Uint8Array>;
    expiration: u64;

    constructor(
      transaction_id: Uint8Array = new Uint8Array(0),
      token: Uint8Array = new Uint8Array(0),
      recipient: Uint8Array = new Uint8Array(0),
      value: u64 = 0,
      signatures: Array<Uint8Array> = [],
      expiration: u64 = 0
    ) {
      this.transaction_id = transaction_id;
      this.token = token;
      this.recipient = recipient;
      this.value = value;
      this.signatures = signatures;
      this.expiration = expiration;
    }
  }

  export class add_validator_arguments {
    static encode(message: add_validator_arguments, writer: Writer): void {
      const unique_name_signatures = message.signatures;
      if (unique_name_signatures.length !== 0) {
        for (let i = 0; i < unique_name_signatures.length; ++i) {
          writer.uint32(10);
          writer.bytes(unique_name_signatures[i]);
        }
      }

      if (message.validator.length != 0) {
        writer.uint32(18);
        writer.bytes(message.validator);
      }

      if (message.expiration != 0) {
        writer.uint32(24);
        writer.uint64(message.expiration);
      }
    }

    static decode(reader: Reader, length: i32): add_validator_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new add_validator_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.signatures.push(reader.bytes());
            break;

          case 2:
            message.validator = reader.bytes();
            break;

          case 3:
            message.expiration = reader.uint64();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    signatures: Array<Uint8Array>;
    validator: Uint8Array;
    expiration: u64;

    constructor(
      signatures: Array<Uint8Array> = [],
      validator: Uint8Array = new Uint8Array(0),
      expiration: u64 = 0
    ) {
      this.signatures = signatures;
      this.validator = validator;
      this.expiration = expiration;
    }
  }

  export class remove_validator_arguments {
    static encode(message: remove_validator_arguments, writer: Writer): void {
      const unique_name_signatures = message.signatures;
      if (unique_name_signatures.length !== 0) {
        for (let i = 0; i < unique_name_signatures.length; ++i) {
          writer.uint32(10);
          writer.bytes(unique_name_signatures[i]);
        }
      }

      if (message.validator.length != 0) {
        writer.uint32(18);
        writer.bytes(message.validator);
      }

      if (message.expiration != 0) {
        writer.uint32(24);
        writer.uint64(message.expiration);
      }
    }

    static decode(reader: Reader, length: i32): remove_validator_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new remove_validator_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.signatures.push(reader.bytes());
            break;

          case 2:
            message.validator = reader.bytes();
            break;

          case 3:
            message.expiration = reader.uint64();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    signatures: Array<Uint8Array>;
    validator: Uint8Array;
    expiration: u64;

    constructor(
      signatures: Array<Uint8Array> = [],
      validator: Uint8Array = new Uint8Array(0),
      expiration: u64 = 0
    ) {
      this.signatures = signatures;
      this.validator = validator;
      this.expiration = expiration;
    }
  }

  export class add_supported_token_arguments {
    static encode(
      message: add_supported_token_arguments,
      writer: Writer
    ): void {
      const unique_name_signatures = message.signatures;
      if (unique_name_signatures.length !== 0) {
        for (let i = 0; i < unique_name_signatures.length; ++i) {
          writer.uint32(10);
          writer.bytes(unique_name_signatures[i]);
        }
      }

      if (message.token.length != 0) {
        writer.uint32(18);
        writer.bytes(message.token);
      }

      if (message.expiration != 0) {
        writer.uint32(24);
        writer.uint64(message.expiration);
      }
    }

    static decode(reader: Reader, length: i32): add_supported_token_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new add_supported_token_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.signatures.push(reader.bytes());
            break;

          case 2:
            message.token = reader.bytes();
            break;

          case 3:
            message.expiration = reader.uint64();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    signatures: Array<Uint8Array>;
    token: Uint8Array;
    expiration: u64;

    constructor(
      signatures: Array<Uint8Array> = [],
      token: Uint8Array = new Uint8Array(0),
      expiration: u64 = 0
    ) {
      this.signatures = signatures;
      this.token = token;
      this.expiration = expiration;
    }
  }

  export class remove_supported_token_arguments {
    static encode(
      message: remove_supported_token_arguments,
      writer: Writer
    ): void {
      const unique_name_signatures = message.signatures;
      if (unique_name_signatures.length !== 0) {
        for (let i = 0; i < unique_name_signatures.length; ++i) {
          writer.uint32(10);
          writer.bytes(unique_name_signatures[i]);
        }
      }

      if (message.token.length != 0) {
        writer.uint32(18);
        writer.bytes(message.token);
      }

      if (message.expiration != 0) {
        writer.uint32(24);
        writer.uint64(message.expiration);
      }
    }

    static decode(
      reader: Reader,
      length: i32
    ): remove_supported_token_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new remove_supported_token_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.signatures.push(reader.bytes());
            break;

          case 2:
            message.token = reader.bytes();
            break;

          case 3:
            message.expiration = reader.uint64();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    signatures: Array<Uint8Array>;
    token: Uint8Array;
    expiration: u64;

    constructor(
      signatures: Array<Uint8Array> = [],
      token: Uint8Array = new Uint8Array(0),
      expiration: u64 = 0
    ) {
      this.signatures = signatures;
      this.token = token;
      this.expiration = expiration;
    }
  }

  export class add_supported_wrapped_token_arguments {
    static encode(
      message: add_supported_wrapped_token_arguments,
      writer: Writer
    ): void {
      const unique_name_signatures = message.signatures;
      if (unique_name_signatures.length !== 0) {
        for (let i = 0; i < unique_name_signatures.length; ++i) {
          writer.uint32(10);
          writer.bytes(unique_name_signatures[i]);
        }
      }

      if (message.token.length != 0) {
        writer.uint32(18);
        writer.bytes(message.token);
      }

      if (message.expiration != 0) {
        writer.uint32(24);
        writer.uint64(message.expiration);
      }
    }

    static decode(
      reader: Reader,
      length: i32
    ): add_supported_wrapped_token_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new add_supported_wrapped_token_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.signatures.push(reader.bytes());
            break;

          case 2:
            message.token = reader.bytes();
            break;

          case 3:
            message.expiration = reader.uint64();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    signatures: Array<Uint8Array>;
    token: Uint8Array;
    expiration: u64;

    constructor(
      signatures: Array<Uint8Array> = [],
      token: Uint8Array = new Uint8Array(0),
      expiration: u64 = 0
    ) {
      this.signatures = signatures;
      this.token = token;
      this.expiration = expiration;
    }
  }

  export class remove_supported_wrapped_token_arguments {
    static encode(
      message: remove_supported_wrapped_token_arguments,
      writer: Writer
    ): void {
      const unique_name_signatures = message.signatures;
      if (unique_name_signatures.length !== 0) {
        for (let i = 0; i < unique_name_signatures.length; ++i) {
          writer.uint32(10);
          writer.bytes(unique_name_signatures[i]);
        }
      }

      if (message.token.length != 0) {
        writer.uint32(18);
        writer.bytes(message.token);
      }

      if (message.expiration != 0) {
        writer.uint32(24);
        writer.uint64(message.expiration);
      }
    }

    static decode(
      reader: Reader,
      length: i32
    ): remove_supported_wrapped_token_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new remove_supported_wrapped_token_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.signatures.push(reader.bytes());
            break;

          case 2:
            message.token = reader.bytes();
            break;

          case 3:
            message.expiration = reader.uint64();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    signatures: Array<Uint8Array>;
    token: Uint8Array;
    expiration: u64;

    constructor(
      signatures: Array<Uint8Array> = [],
      token: Uint8Array = new Uint8Array(0),
      expiration: u64 = 0
    ) {
      this.signatures = signatures;
      this.token = token;
      this.expiration = expiration;
    }
  }

  export class set_fee_wallet_arguments {
    static encode(message: set_fee_wallet_arguments, writer: Writer): void {
      const unique_name_signatures = message.signatures;
      if (unique_name_signatures.length !== 0) {
        for (let i = 0; i < unique_name_signatures.length; ++i) {
          writer.uint32(10);
          writer.bytes(unique_name_signatures[i]);
        }
      }

      if (message.fee_to.length != 0) {
        writer.uint32(18);
        writer.bytes(message.fee_to);
      }

      if (message.fee_amount != 0) {
        writer.uint32(24);
        writer.uint64(message.fee_amount);
      }

      if (message.expiration != 0) {
        writer.uint32(32);
        writer.uint64(message.expiration);
      }
    }

    static decode(reader: Reader, length: i32): set_fee_wallet_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new set_fee_wallet_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.signatures.push(reader.bytes());
            break;

          case 2:
            message.fee_to = reader.bytes();
            break;

          case 3:
            message.fee_amount = reader.uint64();
            break;

          case 4:
            message.expiration = reader.uint64();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    signatures: Array<Uint8Array>;
    fee_to: Uint8Array;
    fee_amount: u64;
    expiration: u64;

    constructor(
      signatures: Array<Uint8Array> = [],
      fee_to: Uint8Array = new Uint8Array(0),
      fee_amount: u64 = 0,
      expiration: u64 = 0
    ) {
      this.signatures = signatures;
      this.fee_to = fee_to;
      this.fee_amount = fee_amount;
      this.expiration = expiration;
    }
  }

  export class request_new_signatures_arguments {
    static encode(
      message: request_new_signatures_arguments,
      writer: Writer
    ): void {
      if (message.transaction_id.length != 0) {
        writer.uint32(10);
        writer.string(message.transaction_id);
      }

      if (message.operation_id.length != 0) {
        writer.uint32(18);
        writer.string(message.operation_id);
      }
    }

    static decode(
      reader: Reader,
      length: i32
    ): request_new_signatures_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new request_new_signatures_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.transaction_id = reader.string();
            break;

          case 2:
            message.operation_id = reader.string();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    transaction_id: string;
    operation_id: string;

    constructor(transaction_id: string = "", operation_id: string = "") {
      this.transaction_id = transaction_id;
      this.operation_id = operation_id;
    }
  }

  export class get_transfer_status_arguments {
    static encode(
      message: get_transfer_status_arguments,
      writer: Writer
    ): void {
      if (message.transaction_id.length != 0) {
        writer.uint32(10);
        writer.bytes(message.transaction_id);
      }
    }

    static decode(reader: Reader, length: i32): get_transfer_status_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new get_transfer_status_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.transaction_id = reader.bytes();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    transaction_id: Uint8Array;

    constructor(transaction_id: Uint8Array = new Uint8Array(0)) {
      this.transaction_id = transaction_id;
    }
  }

  export class tokens_locked_event {
    static encode(message: tokens_locked_event, writer: Writer): void {
      if (message.from.length != 0) {
        writer.uint32(10);
        writer.bytes(message.from);
      }

      if (message.token.length != 0) {
        writer.uint32(18);
        writer.bytes(message.token);
      }

      if (message.amount.length != 0) {
        writer.uint32(26);
        writer.string(message.amount);
      }

      if (message.chain_id != 0) {
        writer.uint32(32);
        writer.uint32(message.chain_id);
      }

      if (message.recipient.length != 0) {
        writer.uint32(42);
        writer.string(message.recipient);
      }
    }

    static decode(reader: Reader, length: i32): tokens_locked_event {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new tokens_locked_event();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.from = reader.bytes();
            break;

          case 2:
            message.token = reader.bytes();
            break;

          case 3:
            message.amount = reader.string();
            break;

          case 4:
            message.chain_id = reader.uint32();
            break;

          case 5:
            message.recipient = reader.string();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    from: Uint8Array;
    token: Uint8Array;
    amount: string;
    chain_id: u32;
    recipient: string;

    constructor(
      from: Uint8Array = new Uint8Array(0),
      token: Uint8Array = new Uint8Array(0),
      amount: string = "",
      chain_id: u32 = 0,
      recipient: string = ""
    ) {
      this.from = from;
      this.token = token;
      this.amount = amount;
      this.chain_id = chain_id;
      this.recipient = recipient;
    }
  }

  export class transfer_completed_event {
    static encode(message: transfer_completed_event, writer: Writer): void {
      if (message.tx_id.length != 0) {
        writer.uint32(10);
        writer.bytes(message.tx_id);
      }
    }

    static decode(reader: Reader, length: i32): transfer_completed_event {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new transfer_completed_event();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.tx_id = reader.bytes();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    tx_id: Uint8Array;

    constructor(tx_id: Uint8Array = new Uint8Array(0)) {
      this.tx_id = tx_id;
    }
  }

  export class add_remove_action_hash {
    static encode(message: add_remove_action_hash, writer: Writer): void {
      if (message.action != 0) {
        writer.uint32(8);
        writer.int32(message.action);
      }

      if (message.address.length != 0) {
        writer.uint32(18);
        writer.bytes(message.address);
      }

      if (message.nonce != 0) {
        writer.uint32(24);
        writer.uint64(message.nonce);
      }

      if (message.contract_id.length != 0) {
        writer.uint32(34);
        writer.bytes(message.contract_id);
      }

      if (message.expiration != 0) {
        writer.uint32(40);
        writer.uint64(message.expiration);
      }

      if (message.chain != 0) {
        writer.uint32(48);
        writer.uint32(message.chain);
      }
    }

    static decode(reader: Reader, length: i32): add_remove_action_hash {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new add_remove_action_hash();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.action = reader.int32();
            break;

          case 2:
            message.address = reader.bytes();
            break;

          case 3:
            message.nonce = reader.uint64();
            break;

          case 4:
            message.contract_id = reader.bytes();
            break;

          case 5:
            message.expiration = reader.uint64();
            break;

          case 6:
            message.chain = reader.uint32();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    action: action_id;
    address: Uint8Array;
    nonce: u64;
    contract_id: Uint8Array;
    expiration: u64;
    chain: u32;

    constructor(
      action: action_id = 0,
      address: Uint8Array = new Uint8Array(0),
      nonce: u64 = 0,
      contract_id: Uint8Array = new Uint8Array(0),
      expiration: u64 = 0,
      chain: u32 = 0
    ) {
      this.action = action;
      this.address = address;
      this.nonce = nonce;
      this.contract_id = contract_id;
      this.expiration = expiration;
      this.chain = chain;
    }
  }

  export class set_pause_action_hash {
    static encode(message: set_pause_action_hash, writer: Writer): void {
      if (message.action != 0) {
        writer.uint32(8);
        writer.int32(message.action);
      }

      if (message.pause != false) {
        writer.uint32(16);
        writer.bool(message.pause);
      }

      if (message.nonce != 0) {
        writer.uint32(24);
        writer.uint64(message.nonce);
      }

      if (message.contract_id.length != 0) {
        writer.uint32(34);
        writer.bytes(message.contract_id);
      }

      if (message.expiration != 0) {
        writer.uint32(40);
        writer.uint64(message.expiration);
      }

      if (message.chain != 0) {
        writer.uint32(48);
        writer.uint32(message.chain);
      }
    }

    static decode(reader: Reader, length: i32): set_pause_action_hash {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new set_pause_action_hash();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.action = reader.int32();
            break;

          case 2:
            message.pause = reader.bool();
            break;

          case 3:
            message.nonce = reader.uint64();
            break;

          case 4:
            message.contract_id = reader.bytes();
            break;

          case 5:
            message.expiration = reader.uint64();
            break;

          case 6:
            message.chain = reader.uint32();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    action: action_id;
    pause: bool;
    nonce: u64;
    contract_id: Uint8Array;
    expiration: u64;
    chain: u32;

    constructor(
      action: action_id = 0,
      pause: bool = false,
      nonce: u64 = 0,
      contract_id: Uint8Array = new Uint8Array(0),
      expiration: u64 = 0,
      chain: u32 = 0
    ) {
      this.action = action;
      this.pause = pause;
      this.nonce = nonce;
      this.contract_id = contract_id;
      this.expiration = expiration;
      this.chain = chain;
    }
  }

  export class complete_transfer_hash {
    static encode(message: complete_transfer_hash, writer: Writer): void {
      if (message.action != 0) {
        writer.uint32(8);
        writer.int32(message.action);
      }

      if (message.transaction_id.length != 0) {
        writer.uint32(18);
        writer.bytes(message.transaction_id);
      }

      if (message.token.length != 0) {
        writer.uint32(26);
        writer.bytes(message.token);
      }

      if (message.recipient.length != 0) {
        writer.uint32(34);
        writer.bytes(message.recipient);
      }

      if (message.amount != 0) {
        writer.uint32(40);
        writer.uint64(message.amount);
      }

      if (message.contract_id.length != 0) {
        writer.uint32(50);
        writer.bytes(message.contract_id);
      }

      if (message.expiration != 0) {
        writer.uint32(56);
        writer.uint64(message.expiration);
      }

      if (message.chain != 0) {
        writer.uint32(64);
        writer.uint32(message.chain);
      }
    }

    static decode(reader: Reader, length: i32): complete_transfer_hash {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new complete_transfer_hash();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.action = reader.int32();
            break;

          case 2:
            message.transaction_id = reader.bytes();
            break;

          case 3:
            message.token = reader.bytes();
            break;

          case 4:
            message.recipient = reader.bytes();
            break;

          case 5:
            message.amount = reader.uint64();
            break;

          case 6:
            message.contract_id = reader.bytes();
            break;

          case 7:
            message.expiration = reader.uint64();
            break;

          case 8:
            message.chain = reader.uint32();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    action: action_id;
    transaction_id: Uint8Array;
    token: Uint8Array;
    recipient: Uint8Array;
    amount: u64;
    contract_id: Uint8Array;
    expiration: u64;
    chain: u32;

    constructor(
      action: action_id = 0,
      transaction_id: Uint8Array = new Uint8Array(0),
      token: Uint8Array = new Uint8Array(0),
      recipient: Uint8Array = new Uint8Array(0),
      amount: u64 = 0,
      contract_id: Uint8Array = new Uint8Array(0),
      expiration: u64 = 0,
      chain: u32 = 0
    ) {
      this.action = action;
      this.transaction_id = transaction_id;
      this.token = token;
      this.recipient = recipient;
      this.amount = amount;
      this.contract_id = contract_id;
      this.expiration = expiration;
      this.chain = chain;
    }
  }

  export class set_fee_wallet_hash {
    static encode(message: set_fee_wallet_hash, writer: Writer): void {
      if (message.action != 0) {
        writer.uint32(8);
        writer.int32(message.action);
      }

      if (message.fee_amount != 0) {
        writer.uint32(16);
        writer.uint64(message.fee_amount);
      }

      if (message.fee_to.length != 0) {
        writer.uint32(26);
        writer.bytes(message.fee_to);
      }

      if (message.expiration != 0) {
        writer.uint32(32);
        writer.uint64(message.expiration);
      }

      if (message.chain != 0) {
        writer.uint32(40);
        writer.uint32(message.chain);
      }
    }

    static decode(reader: Reader, length: i32): set_fee_wallet_hash {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new set_fee_wallet_hash();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.action = reader.int32();
            break;

          case 2:
            message.fee_amount = reader.uint64();
            break;

          case 3:
            message.fee_to = reader.bytes();
            break;

          case 4:
            message.expiration = reader.uint64();
            break;

          case 5:
            message.chain = reader.uint32();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    action: action_id;
    fee_amount: u64;
    fee_to: Uint8Array;
    expiration: u64;
    chain: u32;

    constructor(
      action: action_id = 0,
      fee_amount: u64 = 0,
      fee_to: Uint8Array = new Uint8Array(0),
      expiration: u64 = 0,
      chain: u32 = 0
    ) {
      this.action = action;
      this.fee_amount = fee_amount;
      this.fee_to = fee_to;
      this.expiration = expiration;
      this.chain = chain;
    }
  }

  export enum action_id {
    reserved_action = 0,
    add_validator = 1,
    remove_validator = 2,
    add_supported_token = 3,
    remove_supported_token = 4,
    add_supported_wrapped_token = 5,
    remove_supported_wrapped_token = 6,
    set_pause = 7,
    complete_transfer = 8,
    set_fee_wallet = 9,
  }
}

import { System, Protobuf, authority } from "koinos-sdk-as";
import { Bridge as ContractClass } from "./Bridge";
import { bridge as ProtoNamespace } from "./proto/bridge";

export function main(): i32 {
  const entryPoint = System.getEntryPoint();
  const rdbuf = System.getContractArguments();
  let retbuf = new Uint8Array(1024);

  const c = new ContractClass();

  switch (entryPoint) {
    case 0x470ebe82: {
      const args = Protobuf.decode<ProtoNamespace.initialize_arguments>(
        rdbuf,
        ProtoNamespace.initialize_arguments.decode
      );
      const res = c.initialize(args);
      retbuf = Protobuf.encode(res, ProtoNamespace.initialize_result.encode);
      break;
    }

    case 0x50068f92: {
      const args = Protobuf.decode<ProtoNamespace.get_validators_arguments>(
        rdbuf,
        ProtoNamespace.get_validators_arguments.decode
      );
      const res = c.get_validators(args);
      retbuf = Protobuf.encode(res, ProtoNamespace.repeated_addresses.encode);
      break;
    }

    case 0xc8e36f04: {
      const args =
        Protobuf.decode<ProtoNamespace.get_supported_tokens_arguments>(
          rdbuf,
          ProtoNamespace.get_supported_tokens_arguments.decode
        );
      const res = c.get_supported_tokens(args);
      retbuf = Protobuf.encode(res, ProtoNamespace.repeated_addresses.encode);
      break;
    }

    case 0x2f540a24: {
      const args =
        Protobuf.decode<ProtoNamespace.get_supported_wrapped_tokens_arguments>(
          rdbuf,
          ProtoNamespace.get_supported_wrapped_tokens_arguments.decode
        );
      const res = c.get_supported_wrapped_tokens(args);
      retbuf = Protobuf.encode(res, ProtoNamespace.repeated_addresses.encode);
      break;
    }

    case 0xfcf7a68f: {
      const args = Protobuf.decode<ProtoNamespace.get_metadata_arguments>(
        rdbuf,
        ProtoNamespace.get_metadata_arguments.decode
      );
      const res = c.get_metadata(args);
      retbuf = Protobuf.encode(res, ProtoNamespace.metadata_object.encode);
      break;
    }

    case 0x39a2c4e4: {
      const args = Protobuf.decode<ProtoNamespace.set_pause_arguments>(
        rdbuf,
        ProtoNamespace.set_pause_arguments.decode
      );
      const res = c.set_pause(args);
      retbuf = Protobuf.encode(res, ProtoNamespace.set_pause_result.encode);
      break;
    }

    case 0x1d2e4ff3: {
      const args = Protobuf.decode<ProtoNamespace.transfer_tokens_arguments>(
        rdbuf,
        ProtoNamespace.transfer_tokens_arguments.decode
      );
      const res = c.transfer_tokens(args);
      retbuf = Protobuf.encode(
        res,
        ProtoNamespace.transfer_tokens_result.encode
      );
      break;
    }

    case 0x4d4d3ef9: {
      const args = Protobuf.decode<ProtoNamespace.complete_transfer_arguments>(
        rdbuf,
        ProtoNamespace.complete_transfer_arguments.decode
      );
      const res = c.complete_transfer(args);
      retbuf = Protobuf.encode(
        res,
        ProtoNamespace.complete_transfer_result.encode
      );
      break;
    }

    case 0xfc15f1be: {
      const args = Protobuf.decode<ProtoNamespace.add_validator_arguments>(
        rdbuf,
        ProtoNamespace.add_validator_arguments.decode
      );
      const res = c.add_validator(args);
      retbuf = Protobuf.encode(res, ProtoNamespace.add_validator_result.encode);
      break;
    }

    case 0xff61ff26: {
      const args = Protobuf.decode<ProtoNamespace.remove_validator_arguments>(
        rdbuf,
        ProtoNamespace.remove_validator_arguments.decode
      );
      const res = c.remove_validator(args);
      retbuf = Protobuf.encode(
        res,
        ProtoNamespace.remove_validator_result.encode
      );
      break;
    }

    case 0xc5ce0923: {
      const args =
        Protobuf.decode<ProtoNamespace.add_supported_token_arguments>(
          rdbuf,
          ProtoNamespace.add_supported_token_arguments.decode
        );
      const res = c.add_supported_token(args);
      retbuf = Protobuf.encode(
        res,
        ProtoNamespace.add_supported_token_result.encode
      );
      break;
    }

    case 0x2d3a597e: {
      const args =
        Protobuf.decode<ProtoNamespace.remove_supported_token_arguments>(
          rdbuf,
          ProtoNamespace.remove_supported_token_arguments.decode
        );
      const res = c.remove_supported_token(args);
      retbuf = Protobuf.encode(
        res,
        ProtoNamespace.remove_supported_token_result.encode
      );
      break;
    }

    case 0x5457c617: {
      const args =
        Protobuf.decode<ProtoNamespace.add_supported_wrapped_token_arguments>(
          rdbuf,
          ProtoNamespace.add_supported_wrapped_token_arguments.decode
        );
      const res = c.add_supported_wrapped_token(args);
      retbuf = Protobuf.encode(
        res,
        ProtoNamespace.add_supported_wrapped_token_result.encode
      );
      break;
    }

    case 0x927c7515: {
      const args =
        Protobuf.decode<ProtoNamespace.remove_supported_wrapped_token_arguments>(
          rdbuf,
          ProtoNamespace.remove_supported_wrapped_token_arguments.decode
        );
      const res = c.remove_supported_wrapped_token(args);
      retbuf = Protobuf.encode(
        res,
        ProtoNamespace.remove_supported_wrapped_token_result.encode
      );
      break;
    }

    default:
      System.exitContract(1);
      break;
  }

  System.setContractResult(retbuf);

  System.exitContract(0);
  return 0;
}

main();
